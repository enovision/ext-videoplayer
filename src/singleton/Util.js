/**
 * @copyright   Enovision GmbH
 * @author      Johan van de Merwe
 * @licence     MIT-Styled License
 * @date        31 July 2017
 * @class       VideoPlayer.singleton.Config
 *
 */

Ext.define('VideoPlayer.singleton.Util', {
    singleton: true,
    alternateClassName: ['VideoPlayerUtil', 'vpUtil'],

    config: {
        'play': 'fa fa-play',
        'pause': 'fa fa-pause',
        'stop': 'fa fa-stop',
        'fullScreen': 'fa fa-expand',
        'repeat': 'fa fa-refresh',
        'volumeOff': 'fa fa-volume-off',
        'volumeUp': 'fa fa-volume-up',
        'urlLoad': 'fa fa-folder',
        'recent': 'fa fa-list-alt',
        'playlist': 'fa fa-music',
        'cC': 'fa fa-cc',
        supportedXtensions: ['webm', 'mp4', 'ogg', 'wmv']
    },

    constructor: function (config) {
        var me = this;
        me.initConfig(config);
        me.callParent();
    },

    /**
     *  Get the proper type of the video to be played
     * @private
     * @param {String} url Video URL
     * @return {String} type Video type
     */
    getVideoType: function (url) {
        if (typeof(url) === 'undefined') return 'video/mp4';

        if (this.youtubeVideoId(url) !== false) {
            return 'video/youtube';
        } else if (this.vimeoVideoId(url) !== false) {
            return 'video/vimeo';
        } else {
            var extension = url.split('.').pop();
            if (this.getSupportedXtensions().indexOf(extension) === 1) {
                return 'video/' + extension;
            } else {
                return false;
            }
        }
    },

    /**
     * JavaScript function to match (and return) the video Id
     * of any valid Youtube Url, given as input string.
     * @author: Stephan Schmitz <eyecatchup@gmail.com>
     * @url: http://stackoverflow.com/a/10315969/624466
     */
    vimeoVideoId: function (url) {
        if (typeof(url) === 'undefined') return false;
        var p = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
        return (url.match(p)) ? RegExp.$1 : false;
    },

    /**
     * JavaScript function to match (and return) the video Id
     * of any valid Youtube Url, given as input string.
     * @author: Stephan Schmitz <eyecatchup@gmail.com>
     * @url: http://stackoverflow.com/a/10315969/624466
     */
    youtubeVideoId: function (url) {
        if (typeof(url) === 'undefined') return false;
        var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        return (url.match(p)) ? RegExp.$1 : false;
    },
    /**
     * Time formatting function
     * Thanks to the Flowplayer jQuery plugin
     * @private
     * @param {Number} sec Time in seconds to be formatted
     * @return {String} Edited Time in seconds ('hh:mm:ss')
     */
    formatTime: function (sec) {

        function zeropad (val) {
            val = parseInt(val, 10);
            return val >= 10 ? val : "0" + val;
        }

        sec = sec || 0;

        var h = Math.floor(sec / 3600),
            min = Math.floor(sec / 60);

        sec = sec - (min * 60);

        if (h >= 1) {
            min -= h * 60;
            return h + ":" + zeropad(min) + ":" + zeropad(sec);
        }

        return zeropad(min) + ":" + zeropad(sec);
    }
});