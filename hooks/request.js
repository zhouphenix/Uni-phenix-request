/**
 * request、response拦截器定义
 */
const interceptors = {
	request: {
		interceptors: [],
		use(func) {
			return this.interceptors.push(func) // 返回长度, 作为识别id
		},
		eject(interceptor) {
			if (typeof interceptor === 'number') {
				const rs = this.interceptors.splice(interceptor - 1, 1) //返回一个列表
				return rs.length > 0 //length > 0 : 删除成功
			} else {
				const index = this.interceptors.indexOf(interceptor)
				const rs = this.interceptors.splice(index, 1) //返回一个列表
				return rs.length > 0 //length > 0 : 删除成功
			}

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
			return this.interceptors.push(func)
		},
		eject(interceptor) {
			if (typeof interceptor === 'number') {
				const rs = this.interceptors.splice(interceptor - 1, 1) //返回一个列表
				return rs.length > 0 //length > 0 : 删除成功
			} else {
				const index = this.interceptors.indexOf(interceptor)
				const rs = this.interceptors.splice(index, 1) //返回一个列表
				return rs.length > 0 //length > 0 : 删除成功
			}
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
		 */
		request({
			url,
			method = 'GET',
			data,
			header
		}) {
			let aborted = false, //// aborted 请求是否已被取消
				requestTask, // requestTask 网络请求 task 对象
				abort = () => { // abort 取消请求方法
					aborted = true // 将请求状态标记为已取消
					requestTask && requestTask.abort() // 执行取消请求方法
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
				} = this.interceptors.request.intercept(config, url, method, data)

				if (aborted || cancel) { // 如果请求已被取消,停止执行,返回 reject
					return this.onerror('网络请求失败：主动取消') || reject('网络请求失败：主动取消')
				}
				// 请求超时执行方法
				timer = setTimeout(_ => {
					overtime = true // 将状态标记为超时，不会被 fail 中的 onerror 重复执行
					requestTask && requestTask.abort() // 执行取消请求方法
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
							this.onerror(`网络请求异常：服务器响应异常：状态码：${res.statusCode}`) || reject(`网络请求异常：服务器响应异常：状态码：${res.statusCode}`)
						} else {
							res = this.interceptors.response.intercept(res, url, method, data) // 执行响应拦截器
							resolve(res.data)
						}
					},

					fail: res => { // 网络请求失败
						// 清除检测超时定时器
						clearTimeout(timer)
						// 如果不是请求超时
						if (overtime) {
							this.onerror(method, url, data, res || '请求超时') || reject(res || '请求超时')
						} else {
							const errorMsg = aborted ? '网络请求失败：主动取消' : '网络请求失败：（URL无效|无网络|DNS解析失败）'
							this.onerror(method, url, data, errorMsg) || reject(errorMsg)
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
			onProgressUpdate
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
				} = this.interceptors.request.intercept(config, url, method, data)
				if (aborted || cancel) { // 如果请求已被取消,停止执行,返回 reject
					return this.onerror(method, url, data, '网络请求失败：主动取消') || reject('网络请求失败：主动取消')
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
							this.onerror(method, url, data, `网络请求异常：服务器响应异常：状态码：${res.statusCode}`) || reject(
								`网络请求异常：服务器响应异常：状态码：${res.statusCode}`)
						} else {
							// 执行响应拦截器
							res = this.interceptors.response.intercept(res, url, method, data) // 执行响应拦截器
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
		},
		onerror: (...args) => {} // 请求错误钩子函数集合
	}
}
