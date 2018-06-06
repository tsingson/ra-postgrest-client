import axios from "axios";
import {
	AUTH_CHECK,
	AUTH_ERROR,
	AUTH_GET_PERMISSIONS,
	AUTH_LOGIN,
	AUTH_LOGOUT
} from "react-admin";
// var authUrl = "http://localhost:3002/rpc/login";
export default authUrl => (type, params) => {
	// logout
	if (type === AUTH_LOGOUT) {
		localStorage.removeItem("token");
		return Promise.resolve();
	}
	// auth error
	if (type === AUTH_ERROR) {
		const status = params.status;
		if (status !== 200) {
			localStorage.removeItem("token");
			return Promise.reject();
		}
		return Promise.resolve();
	}
	// login
	if (type === AUTH_LOGIN) {
		const { username, password } = params;
		//	let url = "http://localhost:3002/rpc/login";
		axios.defaults.headers.post["Content-Type"] = "application/json";
		const axiosOptions = {
			method: "POST",
			headers: {
				"Content-Type": "application/json;charset=utf-8",
				Accept: "application/json"
			},
			data: `{"username":"${username}","password":"${password}"}`,
			url: authUrl
		};
		//
		axios(axiosOptions).then(response => {
			if (response.status === 200) {
				let token = response.data[0].token;
				response.data = { token: token };
				// save token
				localStorage.setItem("token", token);
				return response;
			}
			return response;
		});
		/**
             .catch((error) => {
                    return Promise.reject(error);
                });
             */
		return Promise.resolve();
	}
	// called when the user navigates to a new location
	if (type === AUTH_CHECK) {
		return localStorage.getItem("token")
			? Promise.resolve()
			: Promise.reject();
	}
	// get permissions
	if (type === AUTH_GET_PERMISSIONS) {
		//     const role = localStorage.getItem('role');
		//     return role ? Promise.resolve(role) : Promise.reject();
		return Promise.resolve();
	}

	return Promise.reject("Unknown method");
};
