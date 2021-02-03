<template>
	<view class="content">
		<view class="button-group">
			<button type="default" @click="testGet()">GET</button>
			<button type="default" @click="testPost()">POST</button>
			<button type="default" @click="testPut()">PUT</button>
			<button type="default" @click="testDelete()">DELETE</button>
			<button type="default" @click="testError()">ERROR</button>
			<button type="default" @click="testUpload()">UPLOAD</button>
			<button type="default" @click="testDownload()">DOWNLOAD</button>
		</view>

		<view class="response" v-html="responseText">
		</view>
	</view>
</template>

<script>
	import {
		_get,
		_post,
		customGet,
		downloadFile
	} from '@/api/home/index.js'
	export default {
		data() {
			return {
				responseText: 'Hello demo: [接口地址https://api.xiaobaibk.com/]',
				isLoading: false
			}
		},
		onLoad() {},
		watch: {
			isLoading(val) {
				uni[val ? 'showLoading' : 'hideLoading']({
					title: 'LOADING...'
				})
			}
		},
		methods: {
			logAppend(message) {
				this.responseText = this.responseText.concat(message)
			},
			logRequest(method = 'GET', suffix = 'START') {
				this.logAppend(
					`<p style='color: blue;text-align:center; line-height: 30px;'>========${method}=${suffix}========</p>`)
			},
			testGet() {
				this.logRequest('GET', '根据域名查询百度收录')
				this.isLoading = true
				_get().then(res => {
					this.logAppend(JSON.stringify(res) + `--------<span style='color: blue;'>返回数据</span>`)
					this.logRequest('GET', 'END')
					this.isLoading = false
				}).catch(e => {
					this.isLoading = false
					this.logAppend(JSON.stringify(e) + `--------<span style='color: red;'>【请求异常】</span>`)
					this.logRequest('GET', 'ERROR END')
				})
				/* customGet().then(res => {
					console.log('res:', res);
					this.logAppend(JSON.stringify(res)+ `--------<span style='color: blue;'>返回数据</span>`)
					this.logRequest('GET', 'END')
					this.isLoading = false
				}).catch(e => {
					this.isLoading = false
					this.logAppend(JSON.stringify(e)+ `--------<span style='color: red;'>【请求异常】</span>`)
					this.logRequest('GET', 'ERROR END')
				}) */
			},
			testPost() {
				this.logRequest('POST', '随机获取一条txt语句')
				this.isLoading = true
				_post().then(res => {
					this.logAppend(JSON.stringify(res) + `--------<span style='color: blue;'>返回数据</span>`)
					this.logRequest('POST', 'END')
					this.isLoading = false
				}).catch(e => {
					this.isLoading = false
					this.logAppend(JSON.stringify(e) + `--------<span style='color: red;'>【请求异常】</span>`)
					this.logRequest('POST', 'ERROR END')
				})
			},
			testPut() {
				this.logRequest('PUT', '未写入')

			},
			testDelete() {
				this.logRequest('DELETE', '未写入')

			},
			testUpload() {
				this.logRequest('UPLOAD', '未写入')
			},
			testError() {
				this.logRequest('ERROR', '未写入')
			},
			testDownload() {
				this.logRequest('DOWNLAOD')
				this.isLoading = true
				downloadFile(e => {
					this.responseText = this.responseText.concat(JSON.stringify(e)).concat(
						`--------<span style='color: blue;'>进度回调</span>`)
				}).then(res => {
					this.logAppend(JSON.stringify(res) + `--------<span style='color: blue;'>返回数据</span>`)
					this.logRequest('DOWNLAOD', 'END')
					this.isLoading = false
				}).catch(e => {
					this.isLoading = false
					this.logAppend(JSON.stringify(e) + `--------<span style='color: red;'>【请求异常】</span>`)
					this.logRequest('DOWNLAOD', 'ERROR END')
				})
			}

		}
	}
</script>

<style lang="scss" scoped>
	.content {
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		font-size: 12px;

		.response {
			overflow-y: auto;
			word-break: break-word;
			height: calc(100vh - 76px);
			box-sizing: border-box;
			padding: 10px;
		}

		.button-group {
			display: flex;
			width: 100%;
			position: sticky;
			flex-flow: row wrap;
			box-shadow: 0 2px 4px #ccc;

			button {
				font-size: 12px;
				border: 1px dashed black;
				margin: 0;

				&:nth-child(n):not(:first-child) {
					border-left: none;
				}
			}
		}
	}
</style>
