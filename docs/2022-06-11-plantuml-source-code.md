---
title: "PlantUML 源码备份"
---

# PlantUML 源码备份

本文用来备份博客中出现的 PlantUML 图的源码。

## CVE-2021-30551

```plantuml-svg
@startuml
map transitions_1 {
corrupted_prop =>
}

map transitions_2 {
corrupted_prop =>
}

map map_1 {
transitions *-> transitions_1
descriptors => [regular_prop]
}

map transitions_0 {
regular_prop =>
}

map map_2 {
transitions *-> transitions_2
descriptors => [regular_prop, corrupted_prop]
}

map object_1 {
map *-> map_2
}

map map_3 {
transitions => null
descriptors => [regular_prop, corrupted_prop, corrupted_prop]
}

map object_2 {
map *-> map_3
}

map map_0 {
transitions *-> transitions_0
descriptors => []
}

transitions_0::regular_prop ==> map_1
transitions_1::corrupted_prop ==> map_2
transitions_2::corrupted_prop ==> map_3
@enduml
```

```plantuml-svg
@startuml

package deprecated {
map transitions_1 {
corrupted_prop =>
}

map transitions_2 {
corrupted_prop =>
}

map map_1 {
transitions *-> transitions_1
descriptors => [regular_prop]
}

map map_2 {
transitions *-> transitions_2
descriptors => [regular_prop, corrupted_prop]
}


map map_3 {
transitions => null
descriptors => [regular_prop, corrupted_prop, corrupted_prop]
}


transitions_1::corrupted_prop ==> map_2
transitions_2::corrupted_prop ==> map_3
}

map object_2 {
map *-> deprecated.map_3
}

map transitions_3 {
regular_prop =>
}

map transitions_4 {
corrupted_prop =>
}

map transitions_5 {
corrupted_prop =>
}

map map_4 {
transitions *-> transitions_4
descriptors => [regular_prop]
}

map map_5 {
transitions *-> transitions_5
descriptors => [regular_prop, corrupted_prop]
}

map map_6 {
transitions => null
descriptors => [regular_prop, corrupted_prop, corrupted_prop]
}

map map_0 {
transitions *-> transitions_3
descriptors => []
}

map object_1 {
map *-> map_6
}



transitions_3::regular_prop ==> map_4
transitions_4::corrupted_prop ==> map_5
transitions_5::corrupted_prop ==> map_6
@enduml
```


## CVE-2021-37975

```plantuml-svg
object k_0
object k_1
object k_2
object k_3

map retMap {
}

map m_3 {
k_2 =>
}

map m_2 {
k_2 =>
k_1 =>
}

map m_1 {
k_1 =>
k_0 =>
}

map m_0 {
k_0 =>
initKey =>
}

map map1 {
initKey =>
k_3 =>
}

object initKey

map1::k_3 => retMap
map1::initKey ==> m_0
m_0::k_0 ==> m_1
m_1::k_1 ==> m_2
m_2::k_2 ==> m_3

m_0::initKey ==> k_0
m_1::k_0 ==> k_1
m_2::k_1 ==> k_2
m_3::k_2 ==> k_3
```

```plantuml
@startuml

object k_0
object k_1
object k_2
object k_3

object k_5
object k_7
object k_9
object k_8

map m_8 {
k_8 =>
}

map m_7 {
k_7 =>
k_8 =>
}

map m_5 {
k_3 =>
}

object v9

map retMap {
k_5 =>
k_3 =>
}

map m_3 {
k_2 =>
}

map m_2 {
k_2 =>
k_1 =>
}

map m_1 {
k_1 =>
k_0 =>
}

map m_0 {
k_0 =>
initKey =>
}

map map1 {
initKey =>
k_3 =>
k_7 =>
k_9 =>
}

object initKey

map1::k_3 => retMap
map1::initKey ==> m_0
m_0::k_0 ==> m_1
m_1::k_1 ==> m_2
m_2::k_2 ==> m_3

m_0::initKey ==> k_0
m_1::k_0 ==> k_1
m_2::k_1 ==> k_2

m_3::k_2 ==> k_3

map1::k_7 ==> m_7
map1::k_9 ==> v9

retMap::k_5 ==> m_5
retMap::k_3 ==> k_5

m_5::k_3 ==> k_7
m_7::k_8 ==> m_8
m_7::k_7 ==> k_8

m_8::k_8 ==> k_9

@enduml
```

```plantuml
@startuml

object k_0
object k_1
object k_2
object k_3

object k_5
object k_7
object k_9
object k_8

object Roots

map m_8 {
k_8 =>
}

map m_7 {
k_7 =>
k_8 =>
}

map m_5 {
k_3 =>
}

object v9

map retMap {
k_5 =>
k_3 =>
}

map m_3 {
k_2 =>
}

map m_2 {
k_2 =>
k_1 =>
}

map m_1 {
k_1 =>
k_0 =>
}

map m_0 {
k_0 =>
initKey =>
}

map map1 {
initKey =>
k_3 =>
k_7 =>
k_9 =>
}

object initKey

map1::k_3 => retMap : 5

map1::initKey ==> m_0

m_0::k_0 ==> m_1 : 8
m_0::initKey ==> k_0 : 8

m_1::k_0 ==> k_1 : 7
m_1::k_1 ==> m_2 : 7

m_2::k_2 ==> m_3 : 6
m_2::k_1 ==> k_2 : 6

m_3::k_2 ==> k_3 : 5

map1::k_7 ==> m_7 : 3
map1::k_9 ==> v9 : 0

retMap::k_5 ==> m_5 : 4
retMap::k_3 ==> k_5 : 4

m_5::k_3 ==> k_7 : 3

m_7::k_8 ==> m_8 : 2
m_7::k_7 ==> k_8 : 2

m_8::k_8 ==> k_9 : 1

Roots ==> map1 : *
Roots ==> initKey : *

k_9 o.. map1::k_9

k_8 o.. m_7::k_8
k_8 o.. m_8::k_8

k_7 o.. m_7::k_7
k_7 o.. map1::k_7

k_5 o.. retMap::k_5
k_3 o.. map1::k_3
k_3 o.. retMap::k_3
k_2 o.. m_3::k_2
k_1 o.. m_1::k_1
k_0 o.. m_0::k_0

initKey o.. map1::initKey

@enduml
```