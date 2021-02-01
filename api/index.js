import uni_request from '@/hooks/request.js'

const request = uni_request({ // 有效配置项只有三个
	baseURL: 'http://192.168.0.13/dwbsapp', //baseURL
	timeout: 15000, // 超时时间，单位毫秒。默认 60 秒
	header: {
		'x-custom-header': 'x-custom-header__phenix'
	}, // 设置请求头，建议放在请求拦截器中
	codes: [200, 401] // 服务器相应状态码为 200/401 时，网络请求不会 reject。也就是不会被 catch 到。如响应 401 时可以在响应拦截后 await 刷新 token + await 重新请求 + return response。即可实现无痛刷新。 
})

export default request