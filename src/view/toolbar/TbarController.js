/**
 * Created by jvandemerwe on 4-8-2017.
 */
Ext.define('VideoPlayer.view.toolbar.TbarController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.VideoPlayerTbarController',

    requires: [
        'VideoPlayer.singleton.Util'
    ],

    control: {
        '#': {
            afterrender: 'onAfterrender'
        }
    },

    pSlider: null,
    vSlider: null,
    tTotal: null,
    tPlayed: null,
    recentPlayed: null,

    curentVideo: null,

    videojs: null,

    playTbar: null,
    progressTbar: null,
    /**
     * Called when the view is created
     */
    init: function (view) {
        var me = this;
    },

    /**
     * Executes when the user clicks on the 'stop' button
     * @param {Object} Button
     * @param {Boolean} pressed
     */
    onStopClicked: function (btn) {
        var btnPlay = this.lookupReference('btnPlay');
        btnPlay.setIconCls(btnPlay.iconPlay)
            .setTooltip('Click to Resume');
        this.videojs.trigger('ended');
    },
    /**
     * Executed when the user clicks on the 'Open URL' button
     */
    onUrlLoadClicked: function () {
        Ext.MessageBox.prompt('Load video', 'URL:', this.loadVideo, this);
    },

    /**
     * Clears the recently played videos menu/store
     * @param {Object} btn Clear Recent Button
     */
    onClearRecent: function (btn) {
        var me = this,
            menu = me.lookupReference('RecentMenu'),
            menuItems = menu.query('menuitem');

        menuItems.map(function (item) {
            if (typeof(item.deleteMe) === 'undefined' && item.xtype === 'menuitem') {
                item.destroy();
            }
        });

        me.fireViewEvent('clearrecent', me);

        me.lookupReference('RecentPlayed').disable();
    },

    onCaptionOffClicked: function (btn) {
        this.fireViewEvent('captionsOff');
    },

    /**
     * Executed after the user has clicked on the fullscreen button
     */
    onFullScreenClicked: function () {
        if (this.videojs.paused()) {
            this.videojs.play();
        }

        this.videojs.addClass('vjs-fullscreen');
        this.videojs.requestFullscreen();
    },

    /**
     * Executed when the user clicks on the playing time slider
     * @param {Object} Event
     */
    onProgressSliderClicked: function (e) {
        var me = this;
        var vj = me.videojs;
        if (!vj.paused()) {
            vj.pause();
        }
        var newValue = me.pSlider.getValue();
        vj.currentTime(newValue);
        me.tPlayed.setValue(vpUtil.formatTime(newValue));
        vj.play();
    },
    /**
     * Executes when the user drags the time slider
     * @param {Object} slider Time Slider
     */
    onProgressDrag: function (slider) {
        var me = this;
        var newValue = slider.getValue();
        me.videojs.currentTime(newValue);
        me.tPlayed.setValue(vpUtil.formatTime(newValue));
    },
    /**
     * Executes when the user clicks on the 'play/resume' button
     * @param {Object} Button
     * @param {Boolean} pressed
     * @param {Boolean} noevent
     */
    onPlayClicked: function (btn, pressed) {
        var me = this;
        var vj = me.videojs;

        if (vj.paused()) {
            this.videojs.play();
            btn.setIconCls(btn.iconPause)
                .setTooltip('Click to Pause');
        } else {
            this.videojs.pause();
            btn.setIconCls(btn.iconPlay)
                .setTooltip('Click to Resume');
        }
    },
    /**
     * Executes when the user clicks on the 'pause' button
     * @param {Object} Button
     * @param {Object} Event
     */
    onPauseVideo:

        function (b, e) {
            this.videojs.pause();
        }

    ,
    /**
     * Executes when the user clicks on the volume slider
     * @param {Object} Event
     */
    onVolumeSliderClicked: function (e) {
        var me = this;
        var slider = me.lookupReference('vSlider');
        me.onVolumeChange(slider);
    }
    ,
    /**
     * Called when the volume has changed
     * @param {Object} Volumeslider
     */
    onVolumeChange: function (slider) {
        var newValue = slider.getValue();
        this.videojs.muted(false);
        this.videojs.volume(newValue / 10);
    }
    ,
    /**
     * Executes after the volume change is complete after dragging
     * @param {Object} Volumeslider
     */
    onVolumeChanged: function (slider) {
        this.videojs.muted(false);
        this.currentVolume = slider.getValue() / 10;
    }
    ,
    /**
     * Executed when the user clicks on the 'mute off' button
     * The volume is restored to the last known volume before
     * clicking the mute button
     * @param {Object} Button
     * @param {Object} Event
     */
    onVolumeClicked: function (btn) {
        if (this.videojs.muted()) {
            this.videojs.muted(false);
            btn.setIconCls(btn.iconVolume);
        } else {
            this.videojs.muted(true);
            btn.setIconCls(btn.iconMute);
        }
    }
    ,

    /**
     * Executes when the user clicks on the 'cc' or 'subtitles' button
     * @param {Object} Button
     * @param {Boolean} pressed
     */
    onSubtitlesClicked: function (b, pressed) {
        var me = this;
        var track = me.videojs.textTracks()[0];
        if (pressed) {
            track.show();
        } else {
            track.hide();
        }
    }
    ,

    /**
     * Video Loader
     * Returns false if video can't be loaded
     * @param btn
     * @param url
     * @returns {boolean}
     */
    loadVideo: function (btn, url) {
        var me = this;

        if (btn !== 'ok' && btn !== 'recent') {
            return false;
        }

        if (!vpUtil.getVideoType(url)) {
            me.onVideojsError();
            return false;
        }

        var video = [{
            src: url,
            type: vpUtil.getVideoType(url)
        }];

        /* no captions (yet) when url is directly loaded */
        me.lookupReference('btnSubtitles').hide();

        me.fireViewEvent('btnLoadVideo', video);
    }
})
;