对 std::lock 的规避死锁的方法感兴趣，分析一下相关代码

在 mutex 里找到 lock 的定义

```CPP
template <class _Lock0, class _Lock1, class... _LockN>
void lock(_Lock0& _Lk0, _Lock1& _Lk1, _LockN&... _LkN) { // lock multiple locks, without deadlock
    _Lock_nonmember1(_Lk0, _Lk1, _LkN...);
}
```

_Lock_nonmember1 有两个重载

```CPP

template <class _Lock0, class _Lock1>
void _Lock_nonmember1(_Lock0& _Lk0, _Lock1& _Lk1) {
    // lock 2 locks, without deadlock, special case for better codegen and reduced metaprogramming for common case
    while (_Lock_attempt_small(_Lk0, _Lk1) && _Lock_attempt_small(_Lk1, _Lk0)) { // keep trying
    }
}

template <class _Lock0, class _Lock1, class _Lock2, class... _LockN>
void _Lock_nonmember1(_Lock0& _Lk0, _Lock1& _Lk1, _Lock2& _Lk2, _LockN&... _LkN) {
    // lock 3 or more locks, without deadlock
    int _Hard_lock = 0;
    while (_Hard_lock != -1) {
        _Hard_lock = _Lock_attempt(_Hard_lock, _Lk0, _Lk1, _Lk2, _LkN...);
    }
}
```

先看简单的情况，如果只有两个 mutex 会不断尝试以两种顺序加锁，如直到两个锁都获取到。

```CPP

template <class _Lock0, class _Lock1>
bool _Lock_attempt_small(_Lock0& _Lk0, _Lock1& _Lk1) {
    // attempt to lock 2 locks, by first locking _Lk0, and then trying to lock _Lk1 returns whether to try again
    _Lk0.lock();
    _TRY_BEGIN
    if (_Lk1.try_lock()) {
        return false;
    }
    _CATCH_ALL
    _Lk0.unlock();
    _RERAISE;
    _CATCH_END

    _Lk0.unlock();
    _STD this_thread::yield();
    return true;
}

// EXCEPTION MACROS
#if _HAS_EXCEPTIONS
#define _TRY_BEGIN try {
#define _CATCH(x) \
    }             \
    catch (x) {
#define _CATCH_ALL \
    }              \
    catch (...) {
#define _CATCH_END }

#define _RERAISE  throw
#define _THROW(x) throw x

#else // _HAS_EXCEPTIONS
#define _TRY_BEGIN \
    {              \
        if (1) {
#define _CATCH(x) \
    }             \
    else if (0) {
#define _CATCH_ALL \
    }              \
    else if (0) {
#define _CATCH_END \
    }              \
    }

#ifdef _DEBUG
#define _RAISE(x) _invoke_watson(_CRT_WIDE(#x), __FUNCTIONW__, __FILEW__, __LINE__, 0)
#else // _DEBUG
#define _RAISE(x) _invoke_watson(nullptr, nullptr, nullptr, 0, 0)
#endif // _DEBUG

#define _RERAISE
#define _THROW(x) x._Raise()
#endif // _HAS_EXCEPTIONS

```

再看一般情况

```CPP
template <class _Lock0, class _Lock1, class _Lock2, class... _LockN>
void _Lock_nonmember1(_Lock0& _Lk0, _Lock1& _Lk1, _Lock2& _Lk2, _LockN&... _LkN) {
    // lock 3 or more locks, without deadlock
    int _Hard_lock = 0;
    while (_Hard_lock != -1) {
        _Hard_lock = _Lock_attempt(_Hard_lock, _Lk0, _Lk1, _Lk2, _LkN...);
    }
}

// FUNCTION TEMPLATE lock
template <class... _LockN>
int _Lock_attempt(const int _Hard_lock, _LockN&... _LkN) {
    // attempt to lock 3 or more locks, starting by locking _LkN[_Hard_lock] and trying to lock the rest
    using _Indices = index_sequence_for<_LockN...>;
    _Lock_from_locks(_Hard_lock, _Indices{}, _LkN...);
    int _Failed        = -1;
    int _Backout_start = _Hard_lock; // that is, unlock _Hard_lock

    _TRY_BEGIN
    _Failed = _Try_lock_range(0, _Hard_lock, _LkN...);
    if (_Failed == -1) {
        _Backout_start = 0; // that is, unlock [0, _Hard_lock] if the next throws
        _Failed        = _Try_lock_range(_Hard_lock + 1, sizeof...(_LockN), _LkN...);
        if (_Failed == -1) { // we got all the locks
            return -1;
        }
    }
    _CATCH_ALL
    _Unlock_locks(_Backout_start, _Hard_lock + 1, _Indices{}, _LkN...);
    _RERAISE;
    _CATCH_END

    // we didn't get all the locks, backout
    _Unlock_locks(_Backout_start, _Hard_lock + 1, _Indices{}, _LkN...);
    _STD this_thread::yield();
    return _Failed;
}

template <class... _Types>
using index_sequence_for = make_index_sequence<sizeof...(_Types)>;

template <size_t _Size>
using make_index_sequence = make_integer_sequence<size_t, _Size>;

template <size_t... _Vals>
using index_sequence = integer_sequence<size_t, _Vals...>;

// ALIAS TEMPLATE make_integer_sequence
template <class _Ty, _Ty _Size>
using make_integer_sequence = __make_integer_seq<integer_sequence, _Ty, _Size>;

// __make_integer_seq 是编译器提供的
// 这里可以把 make_index_sequence 简单看成返回 index_sequence<0, 1, ..., Size - 1> 的函数
// 详细信息参考 https://en.cppreference.com/w/cpp/utility/integer_sequence 

// FUNCTION TEMPLATE _Lock_from_locks
template <size_t... _Indices, class... _LockN>
void _Lock_from_locks(const int _Target, index_sequence<_Indices...>, _LockN&... _LkN) { // lock _LkN[_Target]
    int _Ignored[] = {((static_cast<int>(_Indices) == _Target ? (void) _LkN.lock() : void()), 0)...};
    (void) _Ignored;
}

// FUNCTION TEMPLATE try_lock
template <class... _LockN>
int _Try_lock_range(const int _First, const int _Last, _LockN&... _LkN) {
    using _Indices = index_sequence_for<_LockN...>;
    int _Next      = _First;
    _TRY_BEGIN
    for (; _Next != _Last; ++_Next) {
        if (!_Try_lock_from_locks(_Next, _Indices{}, _LkN...)) { // try_lock failed, backout
            _Unlock_locks(_First, _Next, _Indices{}, _LkN...);
            return _Next;
        }
    }
    _CATCH_ALL
    _Unlock_locks(_First, _Next, _Indices{}, _LkN...);
    _RERAISE;
    _CATCH_END

    return -1;
}

// FUNCTION TEMPLATE _Try_lock_from_locks
template <size_t... _Indices, class... _LockN>
bool _Try_lock_from_locks(
    const int _Target, index_sequence<_Indices...>, _LockN&... _LkN) { // try to lock _LkN[_Target]
    bool _Result{};
    int _Ignored[] = {((static_cast<int>(_Indices) == _Target ? (void) (_Result = _LkN.try_lock()) : void()), 0)...};
    (void) _Ignored;
    return _Result;
}

// FUNCTION TEMPLATE _Unlock_locks
template <size_t... _Indices, class... _LockN>
void _Unlock_locks(const int _First, const int _Last, index_sequence<_Indices...>, _LockN&... _LkN) noexcept
/* terminates */ {
    // unlock locks in _LkN[_First, _Last)
    int _Ignored[] = {
        ((_First <= static_cast<int>(_Indices) && static_cast<int>(_Indices) < _Last ? (void) _LkN.unlock() : void()),
            0)...};
    (void) _Ignored;
}
```

这段就是先用 `_Lock_from_locks` 函数锁住序号为 _Target 的锁，之后再调用  `_Try_lock_range` 尝试获取其 `_Target` 之前的锁，如果成功继续尝试获取 `_Target` 之后的锁，如果失败则释放所有的锁，将失败的位置设置为 `_Target`。

