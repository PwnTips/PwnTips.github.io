
先看 `Promise`

```CPP
template <classs _Ty>
class promise {
public:
	promise(): _MyPromise(new _Associasted_state<_Ty>) {}
private:
	_Promise<_Ty> _MyPromise;
};

template <class _Ty>
class promise<_Ty&> {
public:
	promise(): _MyPromise(new _Associated_state<_Ty*>) {}
private:
	_Promise<_Ty*> _MyPromise;
};

template <>
class promise<void> {
public:
	promise(): _MyPromise(new _Associate_state<int>) {}
private:
	_Promise<int> _MyPromise;
};

template <class _Ty>
class _Promise {
public:
	_Promise(_Associate_satte<_Ty>* _State_ptr) : _State(_State_ptr, false),  _Future_retrived(false) {}
private:
	_State_manager<_Ty> _State;
	bool _Future_retrived;
};

template <class _Ty>
class _State_manager {
public:
	_State_manager() : _Assoc_state
private:
_Associated_state<_Ty>* _Assoc_state;
bool _Get_only_once;
};

template <classs _Ty>
class _Associated_state {
public:
	
};


```