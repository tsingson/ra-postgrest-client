import axios from "axios";
import {
    AUTH_LOGIN,
    AUTH_LOGOUT,
    AUTH_ERROR,
    AUTH_CHECK,
    AUTH_GET_PERMISSIONS
} from "react-admin";

export default (type, params) => {
    // logout
    if (type === AUTH_LOGOUT) {
        //	localStorage.removeItem("username");
        localStorage.removeItem("token");
        return Promise.resolve();
    }
    // auth error
    if (type === AUTH_ERROR) {
        const status = params.status;
        if (status !== 200) {
            //	localStorage.removeItem("username");
            localStorage.removeItem("token");
            return Promise.reject();
        }
        return Promise.resolve();
    }
    // login
    if (type === AUTH_LOGIN) {
        const { username, password } = params;
        let url = "http://localhost:3002/rpc/login";
        //
        axios.defaults.headers.post["Content-Type"] = "application/json";
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                Accept: "application/json"
            },
            data: `{"username":"${username}","password":"${password}"}`,
            url: url
        };
        //
        axios(options)
            .then(response => {
                if (response.status === 200) {
                    let token = response.data[0].token;
                    response.data = { token: token };
                    //		localStorage.setItem("username", username);
                    localStorage.setItem("token", token);
                    return response;
                }
                return response;
            })
            .catch(error => {
                //	console.error(error);
                return Promise.reject(error);
            });
        return Promise.resolve();
    }
    // called when the user navigates to a new location
    if (type === AUTH_CHECK) {
        return localStorage.getItem("token")
            ? Promise.resolve()
            : Promise.reject();
    }

    /**
     if (type === AUTH_GET_PERMISSIONS) {
		const token = localStorage.getItem("token");
		if (!token) {
			return Promise.reject();
		}
		const role = localStorage.getItem("role");
		Promise.resolve(role);
	}
     */
    //
    return Promise.reject("Unknown method");
};
