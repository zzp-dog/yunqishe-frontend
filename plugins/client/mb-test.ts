// 开启移动端eruda测试
import DomUtil from '@/core/modules/util/dom-util';
if(process.client && DomUtil.isMB()) {
    setTimeout(() => {
        require('eruda/eruda').init();
    }, 0)
};