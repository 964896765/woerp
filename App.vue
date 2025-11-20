<script>
	export default {
		onLaunch: function() {
			console.log('App Launch');
			
			// 设置状态栏为深蓝色背景，白色文字
			uni.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#0A1F34'
			});
			
			// 注意：uni.setStatusBarStyle在某些平台不支持，改用条件编译
			// #ifdef APP-PLUS
			plus.navigator.setStatusBarStyle('light');
			// #endif
			
			// #ifdef MP-WEIXIN
			// 微信小程序特定初始化
			wx.getSystemInfo({
				success: (res) => {
					// 获取系统信息，用于适配不同设备
					uni.setStorageSync('systemInfo', res);
					console.log('微信小程序系统信息:', res);
				}
			});
			// #endif
			
			// #ifdef APP-NVUE
			plus.screen.lockOrientation('portrait-primary');

			let appid = plus.runtime.appid;
			if (appid && appid.toLocaleLowerCase() != "hbuilder") {
				uni.request({
					url: 'https://uniapp.dcloud.io/update', //检查更新的服务器地址
					data: {
						appid: plus.runtime.appid,
						version: plus.runtime.version
					},
					success: (res) => {
						console.log('success', res);
						if (res.statusCode == 200 && res.data.isUpdate) {
							let openUrl = plus.os.name === 'iOS' ? res.data.iOS : res.data.Android;
							// 提醒用户更新
							uni.showModal({
								title: '更新提示',
								content: res.data.note ? res.data.note : '是否选择更新',
								success: (showResult) => {
									if (showResult.confirm) {
										plus.runtime.openURL(openUrl);
									}
								}
							})
						}
					}
				})
			}

			var domModule = weex.requireModule('dom');
			domModule.addRule('fontFace', {
				'fontFamily': "texticons",
				'src': "url('./static/text-icon.ttf')"
			});
			// #endif
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	
	/* 移动端适配和安全区域 */
	page {
		background-color: #ffffff; /* 改为纯白色背景，使状态栏信息更清晰 */
		height: 100vh;
		/* 添加安全区域支持 */
		padding-top: constant(safe-area-inset-top);
		padding-top: env(safe-area-inset-top);
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		/* 手动设置安全区域 */
		padding-top: 55px;
		padding-bottom: 15px;
	}
	
	/* 全局容器样式 */
	.safe-area-container {
		width: 100%;
		height: 100vh;
		padding-top: 55px;
		padding-bottom: 15px;
		box-sizing: border-box;
		overflow: hidden;
	}
	
	/* 移动端视口设置 */
	html, body {
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 0;
		overflow-x: hidden;
		-webkit-text-size-adjust: 100%;
		-ms-text-size-adjust: 100%;
	}

	/* 全局锁定外层滚动，避免把整页拖走 */
	html, body, #app { height: 100%; overflow: hidden; overscroll-behavior: none; }
	/* 小程序 page 也是全局选择器 */
	page { height: 100vh; overflow: hidden; overscroll-behavior: none; }
	
	/* 微信小程序适配样式 */
	/* #ifdef MP-WEIXIN */
	/* 解决小程序中canvas触摸事件问题 */
	canvas {
		touch-action: none;
	}
	
	/* 小程序中的按钮样式优化 */
	button::after {
		border: none;
	}
	
	/* 小程序中的输入框样式优化 */
	input {
		outline: none;
	}
	
	/* 小程序中的滚动视图优化 */
	scroll-view {
		-webkit-overflow-scrolling: touch;
	}
	/* #endif */
	
	/* 通用样式 */
	view, text, image {
		box-sizing: border-box;
	}
	
	/* 防止长按选中文本 */
	* {
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}
	
	/* 输入框允许选中 */
	input, textarea {
		-webkit-user-select: auto;
		user-select: auto;
	}
	
	/* 移动端触摸优化 */
	* {
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	
	/* 移动端滚动优化 */
	.scroll-container {
		-webkit-overflow-scrolling: touch;
		overflow-scrolling: touch;
	}
	
	/* 响应式字体大小 */
	@media screen and (max-width: 480px) {
		html {
			font-size: 14px;
		}
	}
	
	@media screen and (min-width: 481px) and (max-width: 768px) {
		html {
			font-size: 16px;
		}
	}
	
	@media screen and (min-width: 769px) {
		html {
			font-size: 18px;
		}
	}
</style>
