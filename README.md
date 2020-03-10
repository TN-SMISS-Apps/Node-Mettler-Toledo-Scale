# `Node wrapper for communication with mettler toledo scale`

# Connect Pipes

Used for initializing connection between nodejs and mettler toledo scale.

**URL** : `/pipes/connect`

**Method** : `POST`

**Data constraints**

```
Body not required.
```

## Success Response

**Code** : `200 OK`

**Content example**

```json
{
   "input" : true,
   "output" : true
}
```

## Error Response

**Condition** : Pipes unavailable.

**Code** : `200`

**Content** :

```json
{
    "input": {
        "errno": "ENOENT",
        "code": "ENOENT",
        "syscall": "connect",
        "address": "\\\\.\\pipe\\VCOIn"
    },
    "output": {
        "errno": "ENOENT",
        "code": "ENOENT",
        "syscall": "connect",
        "address": "\\\\.\\pipe\\VCOOut"
    }
}
```

<br>
<hr>
<br>















# Disonnect Pipes

Used for disconnecting from scales.

**URL** : `/pipes/disconnect`

**Method** : `POST`

**Data constraints**

```
Body not required.
```

## Success Response

**Code** : `200 OK`

**Content example**

```
No content
```

## Error Response

```
No error responses, if pipes aren't connected it will have no effect
```

<br>
<hr>
<br>














# Check Pipes status


**URL** : `/pipes/status`

**Method** : `GET`

**Data constraints**

```
Body not required.
```

## Success Response

**Code** : `200 OK`

**Content example**

```json
{
    "is_connected": false
}
```

## Error Response

```
No error responses
```


<br>
<hr>
<br>











# Get weight

Used to collect weight of item on scales.

**URL** : `/scale/weight`

**Method** : `GET`

**Data constraints**

```
Body not required.
```

## Success Response

**Code** : `200 OK`

**Content example**

```json
{
  "scale_status": "kg; 3 decimal places",
  "weight": 0.28,
  "unit_price": 19.32,
  "selling_price": 5.41
}
```

## Error Response

**Condition** : Lots of reasons, check Dialog6 docs for the full list.

**Code** : `409`

**Content** :

```json
{
  "message": "price calculation not yet available",
  "error_code": "22"
}
```
or 

```json
{
  "message": "no motion since last weighing operation",
  "error_code": "21"
}
```
etc...

<br>
<hr>
<br>











# Set scale weighting params

Set unit price, description text and tare weight.

**URL** : `/scale/settings`

**Method** : `POST`

**Data constraints**

```json
{
	"tare": 0.1,
	"unit_price": 19.32,
	"description_text": "test"
}
```

## Success Response

**Code** : `200 OK`

**Content example**

```
No content
```

## Error Response

**Condition** : Same as GET scale/weight plus validation erros.

**Code** : `409`

**Content** :

```json
{
    "message": "Validation failed",
    "error_code": "VALIDATION",
    "error": {
        "_original": {
            "tare": 12130.1,
            "unit_price": 19.32,
            "description_text": "test"
        },
        "details": [
            {
                "message": "\"tare\" must be less than or equal to 9.999",
                "path": [
                    "tare"
                ],
                "type": "number.max",
                "context": {
                    "limit": 9.999,
                    "value": 12130.1,
                    "label": "tare",
                    "key": "tare"
                }
            }
        ]
    }
}
```
