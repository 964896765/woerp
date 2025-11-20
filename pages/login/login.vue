<template>
	<view class="login-container">
		<view class="login-bg">
			<image class="bg-image" src="/static/image/登录图片.jpg" mode="aspectFill"></image>
		</view>
		
		<view class="login-content">
			<view class="logo-section">
				<view class="logo-title">格林旺能源</view>
				<view class="logo-subtitle">材料管理系统</view>
			</view>
			
			<view class="form-section">
				<view class="input-group">
					<view class="input-wrapper">
						<text class="input-icon">👤</text>
						<input 
							class="input-field"
							v-model="username" 
							placeholder="请输入账号" 
							type="text"
						/>
					</view>
				</view>
				
				<view class="input-group">
					<view class="input-wrapper">
						<text class="input-icon">🔒</text>
						<input 
							class="input-field"
							v-model="password" 
							placeholder="请输入密码" 
							type="password"
						/>
					</view>
				</view>
				
				<view class="login-btn-group">
					<button 
						class="login-btn"
						:disabled="isLoading"
						@click="handleLogin"
					>
						{{ isLoading ? '登录中...' : '登录' }}
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { uiUtils } from '@/common/util.js'
	
	export default {
		data() {
			return {
				username: '',
				password: '',
				isLoading: false,
				// 预设的用户账号密码
				validUsers: [
					{ username: 'gelingwangapp', password: 'yangcaiwang' },
					{ username: 'gelingwangapp', password: 'yangchangjin' },
					{ username: 'gelingwangapp', password: 'jinyongfeng' },
					{ username: 'gelingwangapp', password: 'lilu' },
					{ username: 'gelingwangapp', password: 'niexia' },
					{ username: 'gelingwangapp', password: 'chenjun' }
				]
			}
		},
		onLoad() {
			// 检查是否已经登录
			const userInfo = uni.getStorageSync('userInfo');
			if (userInfo) {
				uni.reLaunch({
					url: '/pages/material/index'
				});
			}
		},
		methods: {
			handleLogin() {
				if (!this.username.trim()) {
					uiUtils.showToast('请输入账号');
					return;
				}
				
				if (!this.password.trim()) {
					uiUtils.showToast('请输入密码');
					return;
				}
				
				this.isLoading = true;
				
				// 本地验证登录
				const user = this.validUsers.find(u => 
					u.username === this.username && u.password === this.password
				);
				
				if (user) {
					// 保存登录信息
					const userInfo = {
						username: this.username,
						loginTime: new Date().getTime()
					};
					uni.setStorageSync('userInfo', userInfo);
					
					uiUtils.showSuccess('登录成功');
					
					// 跳转到主页面
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/material/index'
						});
					}, 1500);
				} else {
					uiUtils.showError('账号或密码错误');
				}
				
				this.isLoading = false;
			}
		}
	}
</script>

<style lang="scss" scoped>
.login-container {
	height: 100vh;
	position: relative;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	/* 安全区域适配 */
	padding-top: constant(safe-area-inset-top);
	padding-top: env(safe-area-inset-top);
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	/* 手动设置安全区域 */
	padding-top: 35px;
	padding-bottom: 15px;
	box-sizing: border-box;
	overflow: hidden;
}

.login-bg {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 400rpx;
	z-index: 1;
	
	.bg-image {
		width: 100%;
		height: 100%;
	}
}

.login-content {
	position: relative;
	z-index: 2;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: 0 60rpx;
}

.logo-section {
	text-align: center;
	margin-bottom: 120rpx;
	
	.logo-title {
		font-size: 48rpx;
		font-weight: bold;
		color: #fff;
		margin-bottom: 20rpx;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
	}
	
	.logo-subtitle {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.8);
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
	}
}

.form-section {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 30rpx;
	padding: 60rpx 40rpx;
	box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(10rpx);
}

.input-group {
	margin-bottom: 40rpx;
}

.input-wrapper {
	display: flex;
	align-items: center;
	background: #f8f9fa;
	border-radius: 50rpx;
	padding: 0 30rpx;
	height: 90rpx;
	border: 2rpx solid #e9ecef;
}

.input-icon {
	font-size: 32rpx;
	margin-right: 20rpx;
	color: #6c757d;
}

.input-field {
	flex: 1;
	height: 100%;
	font-size: 30rpx;
	color: #333;
	background: transparent;
	border: none;
	outline: none;
}

.login-btn-group {
	margin-top: 40rpx;
}

.login-btn {
	width: 100%;
	height: 90rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	border: none;
	border-radius: 50rpx;
	font-size: 32rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
}

.login-btn:disabled {
	opacity: 0.6;
}

/* 移动端响应式样式 */
@media screen and (max-width: 480px) {
	.login-content {
		padding: 0 40rpx;
	}
	
	.logo-section {
		margin-bottom: 80rpx;
		
		.logo-title {
			font-size: 44rpx;
		}
		
		.logo-subtitle {
			font-size: 26rpx;
		}
	}
	
	.form-section {
		padding: 50rpx 30rpx;
		border-radius: 25rpx;
	}
	
	.input-wrapper {
		height: 80rpx;
		padding: 0 25rpx;
	}
	
	.input-icon {
		font-size: 28rpx;
		margin-right: 15rpx;
	}
	
	.input-field {
		font-size: 28rpx;
	}
	
	.login-btn {
		height: 80rpx;
		font-size: 30rpx;
	}
}

@media screen and (max-width: 375px) {
	.login-content {
		padding: 0 30rpx;
	}
	
	.logo-section {
		margin-bottom: 60rpx;
		
		.logo-title {
			font-size: 40rpx;
		}
		
		.logo-subtitle {
			font-size: 24rpx;
		}
	}
	
	.form-section {
		padding: 40rpx 25rpx;
	}
	
	.input-wrapper {
		height: 75rpx;
		padding: 0 20rpx;
	}
	
	.input-field {
		font-size: 26rpx;
	}
	
	.login-btn {
		height: 75rpx;
		font-size: 28rpx;
	}
}

/* 横屏适配 */
@media screen and (orientation: landscape) and (max-height: 500px) {
	.login-container {
		padding-top: 20px;
		padding-bottom: 10px;
	}
	
	.logo-section {
		margin-bottom: 40rpx;
		
		.logo-title {
			font-size: 36rpx;
		}
		
		.logo-subtitle {
			font-size: 22rpx;
		}
	}
	
	.form-section {
		padding: 30rpx 40rpx;
	}
	
	.input-group {
		margin-bottom: 30rpx;
	}
	
	.login-btn-group {
		margin-top: 30rpx;
	}
}
</style>
