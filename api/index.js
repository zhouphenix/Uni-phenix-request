import uni_request from '@/hooks/request.js'

const request = uni_request({ // 有效配置项只有三个
	baseUrl: 'https://api.xiaobaibk.com/api', //baseUrl
	timeout: 15000, // 超时时间，单位毫秒。默认 60 秒
	header: {
		'x-custom-header': 'x-custom-header__phenix'
	}, // 设置请求头，建议放在请求拦截器中
	codes: [200, 401] // 服务器相应状态码为 200/401 时，网络请求不会 reject。也就是不会被 catch 到。如响应 401 时可以在响应拦截后 await 刷新 token + await 重新请求 + return response。即可实现无痛刷新。 
})

function testInterceptor(config, ...args) {
	// config.header.Authorization = 'Bearer ' + $store.state.app.token // 修改请求头
	config.body.test = 'test' // 修改请求体
	// config.cancel = true // 取消请求
	console.log('interceptors.request:: ', config)
	// throw '手动抛出一个异常'
	return config
}

const id = request.interceptors.request.use(testInterceptor)

request.interceptors.response.use((response, ...args) => { // 响应拦截器（可以设置多个, 同时可以也可以使用异步方法）
	const { data: res } = response // args[0] method args[1] url args[3] data
	console.log('interceptors.response:: ', res)
	return response
})

// request.interceptors.request.eject(testInterceptor)
// request.interceptors.request.eject(id)

request.onerror = function(...e) {
	// 如果返回异常， 此处却为执行， 说明没有执行到网络请求逻辑， 
	// 检查拦截器是否设置正确, 如我在拦截器中 throw '手动抛出一个异常'，将不会进入此方法
	console.log('onerror::', e);
	return false // 返回true 将拦截reject/resolve， 及Promise catch方法执行
}

export default request
