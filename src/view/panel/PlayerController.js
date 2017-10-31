/**
 * Created by jvandemerwe on 3-8-2017.
 */
Ext.define('VideoPlayer.view.panel.PlayerController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.VideoPlayerController',

    requires: [
        'VideoPlayer.singleton.Loader',
        'VideoPlayer.singleton.Util',
        'VideoPlayer.store.Playlist',
        'VideoPlayer.store.Recent'
    ],

    control: {
        '#': {
            afterrender: 'onAfterrender',
            beforedestroy: 'onBeforedestroy',
            resize: 'onResize'
        },
        'VideoPlayerPlayTbar': {
            btnLoadVideo: 'onBtnLoadVideo',
            captionsOff: 'onCaptionsOff'
        }
    },

    /**
     * @private
     * @cfg {Boolean} [errorFlag=true]
     * Dynamically changing when trying to play a video
     */
    errorFlag: true, /* this changes to false if video can be played */

    videojs: null,
    videojsReady: false,

    playlistStore: null,
    recenctStore: null,

    playTbar: null,
    progressTbar: null,

    /**
     * @hidden
     * @cfg {Object} options
     * Default options for the videojs videoplayer API

     *
     * Values:
     *   +  controls enable the events of the control bar (default: true)
     *   +  ytcontrols enable the youtube controls (default: false)
     *   +  autoplay only works on PC's not on iPad (default: false)
     *   +  preload possible values 'auto', 'meta', 'none' (default: 'auto')
     *   +  poster load a poster by default on the player (default: '')
     *   +  loop (default: false)
     *   +  width (default: 'auto')
     *   +  height (default: 'auto')
     *   +  techOrder: (default: ["html5", "flash"])
     *
     */
    options: {
        controls: true,
        ytcontrols: false,
        autoplay: false,
        preload: 'auto',
        poster: '',
        loop: false,
        width: '100%',
        height: '100%',
        techOrder: ['html5']
    },

    init: function (view) {
        var me = this;

        me.playTbar = view.down('VideoPlayerPlayTbar');
        me.progressTbar = view.down('VideoPlayerProgressTbar');

        me.pSlider = me.progressTbar.lookupReference('pSlider');
        me.vSlider = me.progressTbar.lookupReference('vSlider');
        me.tTotal = me.progressTbar.lookupReference('tTotal');
        me.tPlayed = me.progressTbar.lookupReference('tPlayed');
        me.recentPlayed = me.playTbar.lookupReference('RecentPlayed');

        if (view.autoPlayVideo) {
            me.options.autoplay = true;
        }

        me.playlistStore = Ext.create('VideoPlayer.store.Playlist');

        if (Ext.supports.LocalStorage) {
            me.recentStore = Ext.create('VideoPlayer.store.Recent');
            me.recentStore.load({
                callback: me.loadRecentStore.bind(me)
            });
        }
    },

    onAfterrender: function (view) {
        var me = this;
        var techOrder = [];

        if (view.enableYoutube) {
            vpLoader.load({
                js: [
                    'videojs/js/youtube/youtube.min.js'
                ]
            });
            techOrder.push('Youtube');
        }

        if (view.enableVimeo) {
            vpLoader.load({
                js: [
                    'videojs/js/vimeo/videojs-vimeo.js'
                ]
            });
            techOrder.push('Vimeo');
        }

        if (techOrder.length > 0) {
            me.options['techOrder'] = me.options['techOrder'].concat(techOrder);
        }

        me.loadVideoJSApi();
    },

    onBeforedestroy: function () {
        this.videojs.dispose();
    },

    onResize: function (view) {
        if (this.videojs !== null) {
            this.videojs.width(view.body.getWidth());
            this.videojs.height(view.body.getHeight() - 1);
        }
    },

    /**
     * Initializes the videojs API and loads requested videos
     * @private
     */
    loadVideoJSApi: function () {
        var me = this, vjs, el,
            view = this.getView();

        /* get the <video> element */
        el = view.body.dom.firstChild;

        vjs = videojs(el, me.options);

        vjs.ready(function () {
            me.videojs = this;
            me.progressTbar.getController().videojs = this;
            me.playTbar.getController().videojs = this;
            /* hide the big play button */
            this.bigPlayButton.hide();
            /* set height and width */
            this.width(view.body.getWidth());
            this.height(view.body.getHeight() - 1);
            /* hide the loading spinner */
            this.loadingSpinner.hide();
            /* setoff the player controls by default */
            this.controls(false);
            /* add a class to make things responsible working */
            this.addClass('vjs-video-wrapper');
            /* scope this = videojs player */
            me.videojsReady = true;
            me.bindVideoJSEvents();

            /* set volume */
            this.volume(view.initVolume);
            /* if video is passed then load it here */
            if (view.videos || view.video) {
                me.loadVideoStore();
            }
        });
    },

    /**
     * Bind the videojs player events to functions in this panel
     * @private
     */
    bindVideoJSEvents: function () {
        var me = this;
        var vj = me.videojs;
        /* Fires when the duration of the media resource is first known or changed */
        vj.on('durationchange', me.onDurationChange.bind(me));
        /* Fires when the end of the media resource is reached (currentTime == duration) */
        vj.on('ended', me.onEnded.bind(me));
        /* Fires when the loaded file can't be played */
        vj.on('notsupported', me.onNotSupported.bind(me));
        /* Fires when there is an error in playback */
        vj.on('error', me.onError.bind(me));
        /* Fires the first time a video is played */
        vj.on('firstplay', Ext.emptyFn);
        /* Fired when the player switches in or out of fullscreen mode */
        vj.on('enterfullscreen', me.onFullScreenChange.bind(me));
        vj.on('fullscreenchange', me.onFullScreenChange.bind(me));
        /* Fires when the player has finished downloading the source data */
        vj.on('loadedalldata', Ext.emptyFn);
        /* Fires when the player has downloaded data at the current playback position */
        vj.on('loadeddata', Ext.emptyFn);
        /* Fires when the player has initial duration and dimension information */
        vj.on('loadedmetadata', me.onLoadedMetaData.bind(me));
        /* Fires when the user agent begins looking for media data */
        vj.on('loadstart', Ext.emptyFn);
        /* Fires whenever the media has been paused */
        vj.on('pause', me.onPause.bind(me));
        /* Fires whenever the media begins or resumes playback */
        vj.on('play', me.onPlay.bind(me));
        /* Fires during the user agent is downloading media data */
        vj.on('progress', Ext.emptyFn);
        /* Fires when the current playback position has changed */
        vj.on('timeupdate', me.onTimeUpdate.bind(me));
        /* Fires when the volume changes */
        vj.on('volumechange', Ext.emptyFn);
        /* Fires when the video is resized */
        vj.on('resize', Ext.emptyFn);
    },

    /**
     * load recent records from local storage
     * @param records
     */
    loadRecentStore: function (records) {
        var me = this, video, vid;
        if (records.length > 0) {
            Ext.each(records, function (record) {
                video = record.get('video');
                vid = Ext.isString(video) ? Ext.decode(video) : video;
                me.addRecentItem(vid['video'], vid['poster'], vid['tracks']);
            }, me);

            me.playTbar.lookupReference('RecentPlayed').enable();
        }
    },

    /**
     * Loads the requested video(s)
     * @private
     * @return {Boolean}
     */
    loadVideoStore: function () {
        var me = this,
            view = me.getView(),
            record,
            menu = me.playTbar.lookupReference('Playlist').menu;

        if (Ext.isArray(view.videos)) {

            view.videos.map(function (video) {

                if (video.hasOwnProperty('src')) {
                    record = me.playlistStore.add({
                        src: video.src, // src is obligated !!!
                        poster: video.hasOwnProperty('poster') ? video.poster : false,
                        tracks: video.hasOwnProperty('tracks') ? video.tracks : false
                    });

                    menu.add({
                        text: video.title,
                        record: record[0],
                        scope: me,
                        handler: function (btn) {
                            me.loadPlaylistVideo(btn.record, true);
                        }
                    });

                }
            });

            if (view.autoLoadVideo) {
                var first = me.playlistStore.first();
                if (typeof (first) !== 'undefined') {
                    me.loadPlaylistVideo(first, view.autoPlayVideo);
                    me.playTbar.lookupReference('Playlist').enable();
                    /* TODO, don't show when only 1 video */
                }
            }

        } else {
            if (Ext.isString(view.video)) {
                me.resetPlayer(view['video'], view['poster'], view['track'], false);
            } else {
                return false;
            }
        }
    },
    /**
     * Simple error routine that shows an error when the player can't play
     * a requested or loaded video
     * @private
     */
    onError: function () {
        this.errorFlag = true;
        Ext.MessageBox.show({
            title: 'Playing error',
            msg: 'The video with this URL can\'t be played, try another one',
            buttons: Ext.MessageBox.OK,
            icon: Ext.MessageBox.ERROR
        });
    },
    /**
     * Executed when a loaded file is not supported
     * @private
     * @param {String} message
     *
     */
    onNotSupported: function (message) {
        /* pause any video currently playing */
        var vj = this.videojs.pause();
    },
    /**
     * Executed after videojs pause buttons has been clicked
     * @private
     */
    onPause: function () {
        /*this.onPlayClicked('videojs', false, true); */
    },
    /**
     * Executed after videojs play buttons has been clicked
     * @private
     */
    onPlay: function () {
        /* this.onPlayClicked('videojs', true, true); */
    },
    /**
     * Executed after videojs has loaded the metadata of a video
     * @private
     */
    onLoadedMetaData: function () {
        this.errorFlag = false;
        var v = this.currentVideo;
        this.addRecentItem(v.video, v.poster, v.tracks);
    },

    /**
     * Executed when the duration value of a video changes
     * @private
     */
    onDurationChange: function () {
        var me = this;
        var duration = me.videojs.duration();
        me.pSlider.setMaxValue(duration);
        me.tTotal.setValue(vpUtil.formatTime(duration));
    },

    /**
     * Executed when the videojs API sends back an update of the playing
     * time
     * @private
     */
    onTimeUpdate: function () {
        var me = this;
        if (!me.pSlider.dragging) {
            var time = me.videojs.currentTime();
            me.pSlider.setValue(time);
            me.tPlayed.setValue(vpUtil.formatTime(time));
        }
    },
    /**
     * Executed when the videojs API has changed the volume value
     */
    onVolumeChange: function () {
        var me = this;
        if (me.vSlider.dragging === false) {
            var volume = me.videojs.muted() ? 0 : me.videojs.volume();
        }
    },
    /**
     * Executes when the user clicks the 'stop video' button
     */
    onEnded: function () {
        var me = this;
        var vj = me.videojs;

        if (!vj.ended() && !vj.paused()) {
            vj.pause();
        }

        vj.bigPlayButton.hide();
        vj.currentTime(0);
        vj.posterImage.show();

        // set button icon to play
        me.playTbar.setPlayBtn('play');

    },

    /* event handling panel */

    /**
     * Executed when the fullscreen state of videojs has changed
     * @private
     */
    onFullScreenChange: function () {
        var me = this;
        var vj = me.videojs;
        if (vj.isFullscreen()) {
            vj.controls(true);
        } else {
            vj.controls(false);
        }
    },

    onCaptionsOff: function(tbar) {
        this.loadTrack(-1);
    },
    /**
     * Video loader from a playlist
     * @private
     * @param {Object} record Ext.model.Model
     * @param {Boolean} autoPlay overrides the autoPlay on first video
     */
    loadPlaylistVideo: function (record, autoPlay) {
        var me = this;
        autoPlay = typeof(autoPlay) === 'undefined' ? true : autoPlay;

        /* when video loaded from Playlist play it automatically */
        me.resetPlayer(record.get('src'), record.get('poster'), record.get('tracks'), autoPlay);
    },

    /**
     * Reset Videoplayer
     * @private
     * @param {string} url
     * @param {string} poster
     * @param {object} tracks
     * @param {boolean} autoPlay
     */
    resetPlayer: function (url, poster, tracks, autoPlay) {
        var me = this;
        var view = me.getView();

        var ap = typeof(autoPlay) === 'undefined' ? view.autoPlayVideo : autoPlay;

        poster = poster || false;
        tracks = tracks || false;

        var state = ap ? 'pause' : 'play';
        me.playTbar.setPlayBtn(state);

        me.switchStopButton(url);

        me.videojs.src(url);
        me.videojs.autoplay(ap);

        if (tracks) {
            me.loadTracks(tracks);
        }

        /* switch off captions */
        me.loadTrack(-1);

        if (poster && typeof(poster) !== 'undefined') {
            me.videojs.poster(poster);
        } else {
            me.videojs.poster('');
        }
        me.currentVideo = {
            video: url,
            poster: poster,
            tracks: tracks
        };

        me.errorFlag = true;

    },
    /**
     * Hide/Show Stop Button (like with Vimeo)
     * @private
     * @param {object} video Video URL
     */
    switchStopButton: function (video) {
        var me = this;
        var view = me.getView();

        if (video.type === 'video/vimeo' || view.autoPlay === true) {
            me.playTbar.lookupReference('btnStop').hide();
        } else {
            me.playTbar.lookupReference('btnStop').show();
        }
    },
    /**
     * Loading tracks
     * @param {Array} tracks Video TextTracks
     */
    loadTracks: function (tracks) {
        var me = this;
        var vj = me.videojs;

        var menu = me.playTbar.lookupReference('CaptionsMenu');

        var menuItems = menu.query('menuitem');
        Ext.each(menuItems, function (item, idx) {
            if (typeof (item.deleteMe) === 'undefined' && item.xtype === 'menuitem') {
                item.destroy();
            }
        }, me);

        var idx = 0;
        tracks.map(function (track) {
            vj.addRemoteTextTrack(track, true);
            menu.add({
                text: track.label,
                track: idx++,
                scope: me,
                handler: function (btn) {
                    me.loadTrack(btn.track);
                }
            });
        });

        me.playTbar.lookupReference('btnSubtitles').show();

    },
    /**
     * Load an individual track, called by the loadTracks function
     * returns false when the subtitles have to be switched off
     * @private
     * @param {Object} track Video TextTrack
     * @return {Boolean}
     */
    loadTrack: function (idx) {
        var me = this;
        var tracks = me.videojs.textTracks();

        /* switch off the current Track showing */
        if (Ext.isObject(me.currentTrack) && me.currentTrack.mode === 'show') {
            me.currentTrack.mode = 'hidden';
        }

        /* if idx = -1, then stop here */
        if (idx === -1) {
            return false;
        }

        var track = tracks[idx];
        track.mode = 'showing';
    },
    /**
     * Add a video to the recent items, after the video can play successfully
     * @param {Object} video Last played video object
     * @param {String} poster
     * @param {Object} tracks Tracks with this video
     * @param {Boolean} loader suspend adding the items to the recent list
     * @return {Boolean}
     */
    addRecentItem: function (video, poster, tracks, loader) {
        var me = this;

        poster = poster || false;
        tracks = tracks || false;

        if (typeof video === 'undefined' || (me.errorFlag && typeof( loader ) !== 'undefined')) {
            return false;
        }

        if (Ext.isArray(video)) {
            var text = video[0].src;
        } else if (Ext.isString(video)) {
            text = video;
        }

        var vObj = [{
            src: text,
            type: vpUtil.getVideoType(text)
        }];

        var menu = me.recentPlayed.menu;
        me.recentPlayed.enable();

        var menuItems = menu.query('menuitem');
        var inList = false;

        menuItems.map(function (item) {
            if (item.text === text) {
                inList = true;
            }
        });

        if (!inList) {
            menu.add({
                text: text,
                scope: me,
                video: {
                    video: vObj,
                    poster: poster,
                    tracks: tracks
                },
                handler: function (btn) {
                    var video = btn.video;
                    me.resetPlayer(video.video, video.poster, video.tracks, true); //TODO, what does this mean?
                }
            });

            me.recentStore.add({
                video: Ext.encode({
                    video: vObj,
                    poster: poster,
                    tracks: tracks
                })
            });

            me.recentStore.sync();
        }
    },

    onClearRecent: function (tbar) {
        var me = this;
        me.recentStore.removeAll();
        me.recentStore.sync();
    },

    onBtnLoadVideo: function (tbar, video) {
        var me = this;
        me.resetPlayer(video, false, false, true);
    }
});