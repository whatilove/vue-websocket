import IO from "socket.io-client";

export default {

	install(Vue, connection, opts) {

		let socket;

		if (typeof connection === "object")
			socket = connection;
		else
			socket = IO(connection || "", opts);

		Vue.prototype.$socket = socket;

		let addListeners = function() {
			if (this.$options.hasOwnProperty("socket")) {
				let conf = this.$options.socket;
				if (conf.namespace) {					
					this.$socket = IO(conf.namespace, conf.options);
				}

				if (conf.events) {
					let prefix = conf.prefix || "";
					Object.keys(conf.events).forEach((key) => {
						let func = conf.events[key].bind(this);
						this.$socket.on(prefix + key, func);
						conf.events[key].__binded = func;
					});
				}
			}
		};

		let removeListeners = function() {
			if (this.$options.hasOwnProperty("socket")) {
				let conf = this.$options.socket;

				if (conf.namespace) {
					this.$socket.disconnect();
				}

				if (conf.events) {
					let prefix = conf.prefix || "";
					Object.keys(conf.events).forEach((key) => {
						this.$socket.off(prefix + key, conf.events[key].__binded);
					});
				}
			}
		};

		Vue.mixin({
			created: addListeners,
			beforeDestroy: removeListeners
		});

	}

};
