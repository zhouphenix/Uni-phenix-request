import request from '@/api'

export function get() {
	return request.get('https://api.apiopen.top/getSingleJoke?sid=28654780', {
			param1: 'p1',
			param2: 'p2'
		}
	)
}

export function downloadFile(downloadCallback) {
	return request.download('https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=2980445260,41238050&fm=26&gp=0.jpg',
		downloadCallback)
}
