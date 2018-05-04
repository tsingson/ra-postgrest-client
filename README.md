# ra-postgrest-client : react-admin's dataProvider for postgREST 

**fork from https://github.com/tomberek/aor-postgrest-client  and port to [React-Admin](https://marmelab.com/react-admin/)  ( new name for  admin-on-rest version  2.0 )**

thanks a lot to [tomberek](https://github.com/tomberek)

For using [postgREST](https://github.com/begriffs/postgrest) with [react-admin](https://github.com/marmelab/react-admin), use the `postgrestClient` function to convert React-Admin's REST dialect into one compatible with postgREST.

## some New 
* support React-Admin ( Admin-On-Rest 2.0 ) only 
* support postgRest  4.4 with pgjwt ( generate JWT via pgplsql ) , and will add authProvider for postgRest soon
* support multiple item to delete
* support filters in react-admin well 


## Installation

``` 
yarn add ra-postgrest-client
```

## Usage

```js
// in src/App.js
import React from "react";
import {Admin, Resource, Delete} from "react-admin";

import postgrestClient from "ra-postgrest-client";
import {
    CategoryList,
    CategoryCreate,
    CategoryEdit,
    CategoryShow
} from "./cms/Category";


const App = () => (
    <Admin
        dataProvider={postgrestClient("http://localhost:3002/api")}>
        <Resource
            name="category"
            list={CategoryList}
            create={CategoryCreate}
            edit={CategoryEdit}
            show={CategoryShow}
        />
    </Admin>
);
export default App;

```

## Build

clone the repo and build
```
git clone https://github.com/tsingson/ra-postgrest-client
cd ./ra-postgrest-client
make build
```



## License

This library is licensed under the [MIT Licence](LICENSE)
