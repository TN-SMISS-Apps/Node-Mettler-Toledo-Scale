# `Node wrapper for communication with mettler toledo scale`

<br>
<br>

# DEVELOPMENT
- change `config.ts` pipe paths to match your scale;
- `npm run watch` - for typescript compilation;
- `npm run emulate` - optional command, starts emulator, make sure pipe paths are ok (check `src/utils/emulator.ts` for more info);
- `npm start` - run electron app.

<br>
<br>

# USING APP

Start electron app and use http endpoints to send commands and receive responses.
Available requests are listed below.


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




# Toggle logic version number

Used to collect weight of item on scales.

**URL** : `/scale/show-logic-version` or `/scale/hide-logic-version`

**Method** : `POST`

**Data constraints**

`timeout` - optional param, default is 15000. Value is in milliseconds. If using `/scale/show-logic-version` the logic window will automatically hide in `timeout` ms.

```
{
    "timeout": 10000
}
```

## Success Response

**Code** : `200 OK`

**Content example**

No response

## Error Response

**Condition** : Lots of reasons, check Dialog6 docs for the full list.

**Code** : `409`

**Content** : same as `/scale/weight`

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
    "description_text": "test",
    "should_print_barcode": true,
    "should_print_additional_text": false
}
```

`tare`, `should_print_barcode` and `should_print_additional_text` are optional

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

<br>
<hr>
<br>

# Window Management

Used for managing app window state (shown/hidden).

**URL** : `/window/show` or `/window/hide`

**Method** : `POST`

**Example** : `curl -X POST http://localhost:3000/window/show`

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
No error responses
```