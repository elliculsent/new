(function() {
	'use strict';

	// Registration
	angular.module('cms.services')
		.factory('JwtService', JwtService);

	// Dependency injection
	JwtService.$inject = ['$window'];

	function JwtService($window) {
		var service = {
			urlBase64Decode: urlBase64Decode,
			decodeToken: decodeToken,
			getTokenExpirationDate: getTokenExpirationDate,
			isTokenExpired: isTokenExpired
		};

		return service;

		////////////

		function urlBase64Decode(str) {
			var output = str.replace(/-/g, '+').replace(/_/g, '/');
			switch (output.length % 4) {
				case 0: { break; }
				case 2: { output += '=='; break; }
				case 3: { output += '='; break; }
				default: {
					throw 'Illegal base64url string!';
				}
			}
			return $window.decodeURIComponent(escape($window.atob(output))); //polyfill https://github.com/davidchambers/Base64.js
		};


		function decodeToken(token) {
			var parts = token.split('.');

			if (parts.length !== 3) {
				throw new Error('JWT must have 3 parts');
			}

			var decoded = this.urlBase64Decode(parts[1]);
			if (!decoded) {
				throw new Error('Cannot decode the token');
			}

			return angular.fromJson(decoded);
		}

		function getTokenExpirationDate(token) {
			var decoded = this.decodeToken(token);

			if(typeof decoded.exp === "undefined") {
				return null;
			}

			var d = new Date(0); // The 0 here is the key, which sets the date to the epoch
			d.setUTCSeconds(decoded.exp);

			return d;
		};

		function isTokenExpired(token, offsetSeconds) {
			var d = this.getTokenExpirationDate(token);
			offsetSeconds = offsetSeconds || 0;
			if (d === null) {
				return false;
			}

			// Token expired?
			return !(d.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
		};
	}
})();

