<template>
	<view class="content">
		<view class="response" v-html="responseText">
		</view>

		<view class="button-group">
			<button type="primary" @click="testGet()">get请求</button>
			<button type="primary" @click="testDownload()">download请求</button>
		</view>
	</view>
</template>

<script>
	import {
		get,
		downloadFile
	} from '@/api/home/index.js'
	export default {
		data() {
			return {
				responseText: 'Hello'
			}
		},
		onLoad() {

		},
		methods: {
			testGet() {
				get().then(res => {
					console.log('res:', res);
					this.responseText = this.responseText.concat('<br/>===================<br/>').concat(JSON.stringify(res))
				})
			},
			testDownload() {
				downloadFile(e => {
					this.responseText = this.responseText.concat('<br/>').concat(JSON.stringify(e))
				}).then(res => {
					this.responseText = this.responseText.concat('<br/>===================<br/>').concat(JSON.stringify(res))
				}).catch(e => {
					this.responseText = this.responseText.concat('<br/>===================<br/>').concat(JSON.stringify(e))
				})
			}

		}
	}
</script>

<style lang="scss" scoped>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.response {
			height: 80vh;
			padding: 20px;
			overflow-y: auto;
			word-break: break-word;
		}

		.button-group {
			display: flex;
		}
	}
</style>
