/**
 * request、response拦截器定义
 */
const interceptors = {
	request: {
		interceptors: [],
		use(func) {
			this.interceptors.push(func)
		},
		intercept(config, url, method, data) {
			this.interceptors.forEach(it => {
				config = it(config, url, method, data)
			})
			return config
		}
	},
	response: {
		interceptors: [],
		use(func) {
			this.interceptors.push(func)
		},
		intercept(response, url, method, data) {
			this.interceptors.forEach(it => {
				response = it(response, url, method, data)
			})
			return response
		}
	}
}

export default function({
	baseUrl,
	timeout = 15000,
	header: headers,
	codes = [200, 401]
}) {
	return {
		interceptors,
		/**
		 * 主要功能
		 * @param  url 请求地址
		 * @param method 请求方式， 默认GET
		 * @param data 请求参数
		 * @param header 请求头
		 * @param reqIntercept 请求是否被拦截器拦截 ，默认启用
		 * @param resIntercept 响应是否被拦截器拦截 ，默认启用
		 */
		request({
			url,
			method = 'GET',
			data,
			header,
			reqIntercept = true,
			resIntercept = true
		}) {
			let aborted = false, //// aborted 请求是否已被取消
				requestTask, // requestTask 网络请求 task 对象
				abort = () => { // abort 取消请求方法
					aborted = true // 将请求状态标记为已取消
					requestTask ? requestTask.abort() : '' // 执行取消请求方法
				},
				timer, // timer 检测超时定时器
				overtime = false // overtime 请求是否超时

			// header传入
			let config = {
				header: {
					...headers,
					...header
				}, // 后面覆盖前面规则
				body: data || {}
			}
			let target = new Promise((resolve, reject) => {

				// 请求拦截
				let {
					header,
					body: data,
					cancel
				} = reqIntercept ? this.interceptors.request.intercept(config, url, method, data) : config
				if (aborted || cancel) { // 如果请求已被取消,停止执行,返回 reject
					return reject('网络请求失败：主动取消')
				}
				// 请求超时执行方法
				timer = setTimeout(_ => {
					overtime = true // 将状态标记为超时，不会被 fail 中的 onerror 重复执行
					requestTask.abort() // 执行取消请求方法
					reject('网络请求时间超时') // reject 原因
				}, timeout || 15000) // 设定检测超时定时器
				
				requestTask = uni.request({
					url: url[0] === '/' ? baseUrl + url : url,
					data,
					method,
					header,
					success: res => { // 网络请求成功
						// 清除检测超时定时器
						clearTimeout(timer)

						if (!codes.includes(res.statusCode)) {
							reject(`网络请求异常：服务器响应异常：状态码：${res.statusCode}`)
						} else {
							if (resIntercept) {
								// 执行响应拦截器
								res = this.interceptors.response.intercept(res, url, method, data) // 执行响应拦截器
							}
							resolve(res.data)
						}
					},

					fail: res => { // 网络请求失败
						// 清除检测超时定时器
						clearTimeout(timer)
						if (aborted) {
							reject('网络请求失败：主动取消')
						} else {
							reject('网络请求失败：（URL无效|无网络|DNS解析失败）')
						}
					}

				})

			})
			let handler = {
				get: (target, prop) => { // 如果调用 abort 方法,返回 abort 方法
					if (prop === 'abort') {
						return abort
					} else {
						if (Reflect.get(target, prop) && Reflect.get(target, prop).bind) {
							return Reflect.get(target, prop).bind(target)
						} else {
							return Reflect.get(target, prop)
						}
					}
				}
			}

			// 返回经过 Proxy 后的 Promise 对象使其可以监听到是否调用 abort 方法
			let proxy = new Proxy(target, handler)

			return proxy
		},

		file({
			url,
			method = 'downloadFile',
			data = {},
			header,
			onProgressUpdate,
			reqIntercept = true,
			resIntercept = true
		}) {
			let aborted = false, //// aborted 请求是否已被取消
				requestTask, // requestTask 网络请求 task 对象
				abort = () => { // abort 取消请求方法
					aborted = true // 将请求状态标记为已取消
					requestTask ? requestTask.abort() : '' // 执行取消请求方法
				},
				timer, // timer 检测超时定时器
				overtime = false // overtime 请求是否超时

			// header传入
			let config = {
				header: {
					...headers,
					...header
				}, // 后面覆盖前面规则
				body: data.formData || {}
			}
			let target = new Promise((resolve, reject) => {

				// 请求拦截
				let {
					header,
					body,
					cancel
				} = reqIntercept ? this.interceptors.request.intercept(config, url, method, data) : config
				if (aborted || cancel) { // 如果请求已被取消,停止执行,返回 reject
					return reject('网络请求失败：主动取消')
				}
				// 请求超时执行方法
				timer = setTimeout(_ => {
					overtime = true // 将状态标记为超时，不会被 fail 中的 onerror 重复执行
					requestTask.abort() // 执行取消请求方法
					reject('网络请求时间超时') // reject 原因
				}, timeout || 15000) // 设定检测超时定时器

				requestTask = uni[method]({
					url: url[0] === '/' ? baseUrl + url : url,
					name: data.name,
					header,
					filePath: data.filePath,
					formData: body,
					success: res => { // 网络请求成功
						// 清除检测超时定时器
						clearTimeout(timer)

						if (!codes.includes(res.statusCode)) {
							reject(`网络请求异常：服务器响应异常：状态码：${res.statusCode}`)
						} else {
							if (resIntercept) {
								// 执行响应拦截器
								res = this.interceptors.response.intercept(res, url, method, data) // 执行响应拦截器
							}
							resolve(res)
						}
					},

					fail: res => { // 网络请求失败
						// 清除检测超时定时器
						clearTimeout(timer)
						if (aborted) {
							reject('网络请求失败：主动取消')
						} else {
							reject('网络请求失败：（URL无效|无网络|DNS解析失败）')
						}
					}

				})

				requestTask.onProgressUpdate(onProgressUpdate) // 监听下载进度变化

			})
			let handler = {
				get: (target, prop) => { // 如果调用 abort 方法,返回 abort 方法
					if (prop === 'abort') {
						return abort
					} else {
						if (Reflect.get(target, prop) && Reflect.get(target, prop).bind) {
							return Reflect.get(target, prop).bind(target)
						} else {
							return Reflect.get(target, prop)
						}
					}
				}
			}

			// 返回经过 Proxy 后的 Promise 对象使其可以监听到是否调用 abort 和 onProgressUpdate 方法
			let proxy = new Proxy(target, handler)

			return proxy
		},
		get(url, data, header) {
			return this.request({
				url,
				data,
				header: { ...header,
					...headers
				}
			})
		},
		post(url, data, header) {
			return this.request({
				url,
				data,
				method: 'POST',
				header: { ...header,
					...headers
				}
			})
		},
		put(url, data, header) {
			return this.request({
				url,
				data,
				method: 'PUT',
				header: { ...header,
					...headers
				}
			})
		},
		delete(url, data, header) {
			return this.request({
				method: 'DELETE',
				url,
				data,
				header: { ...header,
					...headers
				}
			})
		},
		connect(url, data, header) {
			return this.request({
				method: 'CONNECT',
				url,
				data,
				header: { ...header,
					...headers
				}
			})
		},
		head(url, data, header) {
			return this.request({
				method: 'HEAD',
				url,
				data,
				header: { ...header,
					...headers
				}
			})
		},
		options(url, data, header) {
			return this.request({
				url,
				data,
				method: 'OPTIONS',
				header: { ...header,
					...headers
				}
			})
		},
		reace(url, data, header) {
			return this.request({
				url,
				data,
				method: 'TRACE',
				header: { ...header,
					...headers
				}
			})
		},
		upload(url, onProgressUpdate, data, header) {
			return this.file({
				url,
				method: 'uploadFile',
				data,
				header: { ...header,
					...headers
				},
				onProgressUpdate
			})
		},
		download(url, onProgressUpdate, data, header) {
			return this.file({
				url,
				method: 'downloadFile',
				data,
				header: { ...header,
					...headers
				},
				onProgressUpdate
			})
		}
	}
}
