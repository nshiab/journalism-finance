[**Journalism Finance v2.0.5**](../index.md)

***

[Journalism Finance](../globals.md) / decodeMonteCarloValues

# Function: decodeMonteCarloValues()

> **decodeMonteCarloValues**(`c`): `object`[]

Decodes a columnar `values` result back into the original object-array shape.

Keys are variable names. Each `Float64Array` has size `iterations × months`.

## Parameters

### c

#### cols

`number`

#### data

`Record`\<`string`, `Float64Array`\>

#### keys

`string`[]

#### rows

`number`

## Returns

`object`[]
