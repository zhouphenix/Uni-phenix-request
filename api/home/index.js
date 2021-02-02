import request from '@/api'

export function _get() {
	return request.get('/baidu.php', {
		url: 'api.xiaobaibk.com'
	})
}
/**
 * 自定义请求示例
 */
export function customGet() {
	return request.request({
		url: 'https://api.xiaobaibk.com/api/baidu.php',
		method: 'GET',
		data: {
			url: 'api.xiaobaibk.com'
		}
	})
}

export function _post() {
	return request.post('https://api.xiaobaibk.com/api/yiyan.php')
}

export function downloadFile(downloadCallback) {
	return request.download('https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=2980445260,41238050&fm=26&gp=0.jpg',
		downloadCallback)
}
