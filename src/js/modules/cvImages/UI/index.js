/**
 * Author: DrowsyFlesh
 * Create: 2019/3/17
 * Description:
 */
import {UI} from 'Libs/UI';
import $ from 'jquery';
import './styles.scss';

export class CvImagesUI extends UI {
    constructor() {
        super({
            name: 'cvImages',
        });
        this.currentSrc = null;
    }

    load = (containers, settings) => {
        const that = this;
        if (!settings.on) return Promise.resolve();
        return new Promise(resolve => {
            $('.page-container .img-box img').wrap('<div class="bilibili-ct-wrapper"></div>')

            const btn = document.createElement('button');
            btn.innerText = '下载图片';
            $(document).on('mouseenter', '.banner-img-holder', function(e) {
               e.preventDefault();
                that.currentSrc = $(this)[0].style.backgroundImage.split('"')[1];
                $(this).append(btn);
                $(btn).on('click', function() {
                    if (that.currentSrc) {
                        chrome.runtime.sendMessage({
                            command: 'cvDownloadImage',
                            src: that.currentSrc,
                            filename: $('.title-container h1')[0].innerText + '_封面',
                        });
                    }
                })
            });

            $(document).on('mouseenter', '.bilibili-ct-wrapper', function(e) {
                e.preventDefault();
                const img = $(this).children('img');
                that.currentSrc = 'https:' + img.attr('src');
                $(this).append(btn);
                $(this).css({
                    width: 'auto',
                    height: img.height(),
                })
                const caption = $(this).next('figcaption')[0].innerText;
                $(btn).on('click', function() {
                    if (that.currentSrc) {
                        chrome.runtime.sendMessage({
                            command: 'cvDownloadImage',
                            src: that.currentSrc,
                            filename: caption || null,
                        });
                    }
                })
            });
            $(document).on('mouseleave', '.bilibili-ct-wrapper, .banner-img-holder', function(e) {
                e.preventDefault();
                $(this).children('button').remove();
            })
            resolve(containers);
        });
    };
}
