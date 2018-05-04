"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

var _reactAdmin = require("react-admin");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (type, params) {
    // logout
    if (type === _reactAdmin.AUTH_LOGOUT) {
        //	localStorage.removeItem("username");
        localStorage.removeItem("token");
        return Promise.resolve();
    }
    // auth error
    if (type === _reactAdmin.AUTH_ERROR) {
        var status = params.status;
        if (status !== 200) {
            //	localStorage.removeItem("username");
            localStorage.removeItem("token");
            return Promise.reject();
        }
        return Promise.resolve();
    }
    // login
    if (type === _reactAdmin.AUTH_LOGIN) {
        var username = params.username,
            password = params.password;

        var url = "http://localhost:3002/rpc/login";
        //
        _axios2.default.defaults.headers.post["Content-Type"] = "application/json";
        var options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                Accept: "application/json"
            },
            data: "{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}",
            url: url
        };
        //
        (0, _axios2.default)(options).then(function (response) {
            if (response.status === 200) {
                var token = response.data[0].token;
                response.data = { token: token };
                //		localStorage.setItem("username", username);
                localStorage.setItem("token", token);
                return response;
            }
            return response;
        }).catch(function (error) {
            //	console.error(error);
            return Promise.reject(error);
        });
        return Promise.resolve();
    }
    // called when the user navigates to a new location
    if (type === _reactAdmin.AUTH_CHECK) {
        return localStorage.getItem("token") ? Promise.resolve() : Promise.reject();
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

module.exports = exports["default"];