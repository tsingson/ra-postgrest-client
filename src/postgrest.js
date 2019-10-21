import {stringify} from 'query-string';
import {
  CREATE,
  DELETE,
  DELETE_MANY,
  fetchUtils,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
  UPDATE,
  UPDATE_MANY,
} from 'ra-core';

/**
 * Maps react-admin queries to a simple REST API
 *
 * The REST dialect is similar to the one of FakeRest
 * @see https://github.com/marmelab/FakeRest
 * @example
 * GET_LIST     => GET http://my.api.url/posts?sort=['title','ASC']&range=[0, 24]
 * GET_ONE      => GET http://my.api.url/posts/123
 * GET_MANY     => GET http://my.api.url/posts?filter={ids:[123,456,789]}
 * UPDATE       => PUT http://my.api.url/posts/123
 * CREATE       => POST http://my.api.url/posts
 * DELETE       => DELETE http://my.api.url/posts/123
 */

const convertFilters = filters => {
  const rest = {};
  Object.keys(filters).map(key => {
    switch (typeof filters[key]) {
      case 'string':
        rest[key] = `eq.${filters[key]}`;
        break;

      case 'boolean':
        rest[key] = `is.${filters[key]}`;
        break;

      case 'undefined':
        rest[key] = 'is.null';
        break;

      case 'number':
        rest[key] = `eq.${filters[key]}`;
        break;

      default:
        rest[key] = `eq.${filters[key]}`;
        break;
    }
    return true;
  });
  return rest;
  // return {};
};

const setSingleResponseHeaders = options => {
  options.headers.set('Prefer', 'return=representation');
  options.headers.set('Accept', 'application/vnd.pgrst.object+json');
};

export default (apiUrl, httpClient = fetchUtils.fetchJson) => {
  const singleResourceUrl = (resource, params) => {
    const query = {id: `eq.${params.id}`};

    return `${apiUrl}/${resource}?${stringify(query)}`;
  };

  /**
   * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
   * @param {String} resource Name of the resource to fetch, e.g. 'posts'
   * @param {Object} params The data request params, depending on the type
   * @returns {Object} { url, options } The HTTP request parameters
   */
  const convertDataRequestToHTTP = (type, resource, params) => {
    let url = '';
    const options = {};

    if (!options.headers) {
      options.headers = new Headers({Accept: 'application/json'});
    }
    // const token = localStorage.getItem("token");
    // if (token.length > 0) {
    //     options.headers.set("Authorization", `Bearer ${token}`);
    // } else {
    //     return;
    // }

    switch (type) {
      case GET_LIST: {
        /**
         Prefer: count=exact
         Content-Range: 0-99
         Accept: application/json
         */
        const {page, perPage} = params.pagination;
        const {field, order} = params.sort;
        options.headers.set('Accept', 'application/json');
        options.headers.set('Prefer', 'count=exact');
        options.headers.set('Range-Unit', 'items');
        options.headers.set(
            'Range',
            `${(page - 1) * perPage}-${page * perPage - 1}`
        );
        // const filters = {};
        const query = {
          order: `${field}.${order.toLowerCase()}`,
        };
        // Object.assign(filters, convertFilters(params.filter));
        // console.error('================================= params');
        // console.error(params);
        // console.error('================================= filters');
        // console.error(params.filter);
        // console.error('================================= query');
        // console.error(query);

        Object.assign(query, convertFilters(params.filter));
        url = `${apiUrl}/${resource}?${stringify(query)}`;
        // url = `${apiUrl}/${resource}`;
        console.error('================================= url ');
        console.error(url);
        break;
      }
      case GET_ONE:
        url = singleResourceUrl(resource, params);
        setSingleResponseHeaders(options);
        break;
      case GET_MANY: {
        url = `${apiUrl}/${resource}?id=in.(${params.ids.join(',')})`;
        break;
      }
      case GET_MANY_REFERENCE: {
        const filters = {};
        const {field, order} = params.sort;
        filters[params.target] = params.id;
        const query = {
          order: `${field}.${order.toLowerCase()}`,
        };
        Object.assign(query, convertFilters(filters));
        console.error('=======================================');
        console.log(params);
        console.log(query);
        // url = `${apiUrl}/${resource}?${stringify(query)}`;
        url =
            `${apiUrl}/${resource}?` +
            params.target +
            `=eq.` +
            params.id;
        break;
      }
      case UPDATE:
        url = singleResourceUrl(resource, params);
        setSingleResponseHeaders(options);
        options.method = 'PATCH';
        options.body = JSON.stringify(params.data);
        break;
      case CREATE:
        url = `${apiUrl}/${resource}`;
        setSingleResponseHeaders(options);
        options.method = 'POST';
        options.body = JSON.stringify(params.data);
        break;
      case DELETE:
        url = params.ids
            ? `${apiUrl}/${resource}?id=in.(${params.ids.join(',')})`
            : singleResourceUrl(resource, params);
        //url = params.ids ? `${apiUrl}/${resource}?id=in.(${params.ids.join(",")})` : singleResourceUrl(resource, params);
        options.method = 'DELETE';
        break;
      default:
        throw new Error(`Unsupported fetch action type ${type}`);
    }
    return {url, options};
  };

  /**
   * @param {Object} response HTTP response from fetch()
   * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
   * @param {String} resource Name of the resource to fetch, e.g. 'posts'
   * @param {Object} params The data request params, depending on the type
   * @returns {Object} Data response
   */
  const convertHTTPResponse = (response, type, resource, params) => {
    const {headers, json} = response;
    switch (type) {
      case GET_LIST:
      case GET_MANY_REFERENCE:
        if (!headers.has('content-range')) {
          throw new Error(
              'The Content-Range header is missing in the HTTP Response. ' +
              'The PostgREST client expects responses for lists of resources to contain ' +
              'this header with the total number of results to build the pagination. ' +
              'If you are using CORS, did you declare Content-Range in the ' +
              'Access-Control-Expose-Headers header?'
          );
        }
        const rangeParts = headers.get('content-range').split('/');
        const total =
            parseInt(rangeParts.pop(), 10) ||
            parseInt(rangeParts[0].split('-').pop(), 10) + 1;

        return {
          data: json,
          total: total,
        };
      case CREATE:
        return {data: {...params.data, id: json.id}};
        // case DELETE_MANY: {
        //     return { data: json || [] };
        // }
      default:
        return {data: json};
    }
  };

  /**
   * @param {string} type Request type, e.g GET_LIST
   * @param {string} resource Resource name, e.g. "posts"
   * @param {Object} payload Request parameters. Depends on the request type
   * @returns {Promise} the Promise for a data response
   */
  return (type, resource, params) => {
    // simple-rest doesn't handle filters on UPDATE route, so we fallback to calling UPDATE n times instead
    if (type === UPDATE_MANY) {
      return Promise.all(
          params.ids.map(id =>
              httpClient(`${apiUrl}/${resource}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(params.data),
              })
          )
      ).then(responses => ({
        data: responses.map(response => response.json),
      }));
    }
    // simple-rest doesn't handle filters on DELETE route, so we fallback to calling DELETE n times instead
    if (type === DELETE_MANY) {
      return Promise.all(
          params.ids.map(id =>
              httpClient(`${apiUrl}/${resource}/${id}`, {
                method: 'DELETE',
              })
          )
      ).then(responses => ({
        data: responses.map(response => response.json),
      }));
    }

    const {url, options} = convertDataRequestToHTTP(type, resource, params);
    return httpClient(url, options).then(response =>
        convertHTTPResponse(response, type, resource, params)
    );
  };
};
