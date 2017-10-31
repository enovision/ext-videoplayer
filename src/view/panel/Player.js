/**
 * @class VideoPlayer.view.Player
 * @alias widget.VideoPlayer
 * @alternateClassName VideoPlayerPanel
 * Videoplayer for Ext JS 6, based on the videojs player.
 * Link to videoplayer: http://www.videojs.com/
 * Version 2.0
 * @author  J.J. van de Merwe
 * http://www.enovision.net
 */
Ext.require(['VideoPlayer.singleton.Loader']);

Ext.define('VideoPlayer.view.panel.Player', {
    extend: 'Ext.panel.Panel',
    alternateClassName: ['VideoPlayerPanel'],
    xtype: 'VideoPlayerPanel',

    controller: 'VideoPlayerController',

    requires: [
        'VideoPlayer.view.panel.PlayerController',
        'VideoPlayer.view.toolbar.Play',
        'VideoPlayer.view.toolbar.Progress'
    ],

    bodyCls: 'videojs videojspanel',

    layout: {
        type: 'fit'
    },
    /**
     * @private
     * @cfg {Object/Boolean} [currentVideo=false]
     * Currently loaded video
     */
    currentVideo: false,
    /**
     * @private
     * @cfg {Object/Boolean} [currentTrack=false]
     * Currently loaded track
     */
    currentTrack: false,
    /**
     * Background color of the video body
     * @private
     * @cfg {String} [bodyBackgroundColor='#000']
     */
    bodyBackgroundColor: '#000',

    /**
     * @cfg {Number} [initVolume=0.2]
     * Initial volume level, between 0 and 1, with increments of 0.1
     */
    initVolume: 0.2,
    /**
     * @cfg {Boolean} [autoPlayVideo=true]
     * `true` to play loaded video automatically, `false` to just load it.
     */
    autoPlayVideo: true,
    /**
     * @cfg {Boolean} [autoLoadVideo=true]
     * `true` to load the first video of a playlist automatically.
     */
    autoLoadVideo: true,
    /**
     * @cfg {Boolean} [enableYoutube=false]
     * `true` to make the player a Youtube player.
     */
    enableYoutube: false,
    /*
     * @cfg {Boolean/Object} tracks
     * See {@link #videos} for more information
     */
    tracks: false,
    /**
     * @cfg {Boolean/String} [video=false]
     * url of a video to be loaded, use the
     *
     */
    video: false,
    /**
     * @cfg {Boolean/Array} videos
     * Object of the videos initially loaded
     *
     * The videos Array contains of objects that contain information about
     * the videos to be loaded.
     *
     *   + title  [required]
     *     (String) General title of the video that shows up in the playlist
     * combobox
     *   + src  [required]
     *     (Array) Array of objects with the 'type' and 'src' elements, see
     * sample below
     *     Sources can be local or remote, remote play success depends on the
     *     remote external site
     *     It is required to have at least one 'src' object declared
     *   + poster
     *     (String) Link to the image that will show up as a poster when the
     * video is loaded
     *   + tracks
     *     (Array) Array of objects that describe the textTracks that will be
     * loaded
     *      with the video. It is not required to declare the 'tracks' array in
     * the 'videos'
     *      array, when no tracks available, leave this element away.
     *
     * Tracks configuration per object in the 'tracks' array:
     *
     *   + kind [required]
     *     (String) possible values:
     *     + 'subtitles'
     *     + 'captions'
     *     + 'chapters'
     *   + id
     *     (String) Unique id for the track
     *   + src  [required]
     *     (String) URL to the .vtt file, see example below
     *   + srcLang  [required]
     *     (String) 2 character ISO code for language f.e. 'en', 'de', 'nl'
     *   + label
     *     (String) descriptive text description, like 'English Instruction'
     *   + language
     *     (String) descriptive language description like f.e. 'Dutch', 'English'
     *
     *
     * # Example usage
     *
     *     @example
     *         videos : [{
     *    			 title : 'Instruction Video',
     *			     src : [{
     * 	        		  'type' : 'video/mp4',
     *		              'src' : 'http://www.example.com/movie.mp4'
     *			     }, {
     *      		      'type' : 'video/webm',
     *			          'src' : 'http://www.example.com/movie.webm'
     *     			 }, {
     *            		  'type' : 'video/ogg',
     *		              'src' : 'http://www.example.com/movie.ogg'
     *			     }],
     *			     poster : 'http://example.com/thumbs/movieposter.jpg',
     * 			     tracks : [{
     *                    kind : 'subtitles',
     *			          id : 'englishtrack',
     *            		  src : 'http://www.example.com/captions.vtt',
     *            		  srcLang : 'en',
     *            		  language : 'English',
     *            		  label : 'English'
     *     			 }, {
     *            		  kind : 'subtitles',
     *            		  id : 'germantrack',
     *            		  src : 'http://www.example.com/de-captions.vtt',
     *            		  srcLang : 'en',
     *            		  language : 'German',
     *            		  label : 'German'
     *     			 }, {
     *            		  kind : 'captions',
     *            		  id : 'speakertrack',
     *            		  src : 'http://www.example.com/speakers.vtt',
     *            		  srcLang : 'en',
     *            		  language : 'English',
     *            		  label : 'Speakers'
     *               }]
     * 			}, {
     *    			 title : 'Local Instruction Video',
     * 			     src : [{
     *                    'type' : 'video/mp4',
     * 		              'src' : '/video/movie-2.mp4'
     *    			 }, {
     *            		  'type' : 'video/webm',
     *            		  'src' : '/video/video-2.webm'
     *    			 }, {
     *            		  'type' : 'video/wmv',
     *            		  'src' : '/video/movie-2.wmv'
     *    			 }],
     *    			 poster : '/video/video-2-poster.jpg',
     *				 tracks : [{
     *                    kind : 'captions',
     *		              id : 'englishtrack',
     *       		      src : '/video/captions.vtt',
     *            		  srcLang : 'en',
     *       		      language : 'English',
     *            		  label : 'Captions'
     *    			}]
     * 	        }]
     *
     */
    videos: false,
    /**
     * @cfg {Boolean} [showUrlLoad=true]
     * Show the load URL button on the panel, 'true' when yes, 'false' when no
     * set to 'false' when the player is used for showing only one video at a
     * time
     */
    showUrlLoad: true,
    /**
     * @cfg {Boolean} [showPlaylist=true]
     * Show the playlist button on the panel, 'true' when yes, 'false' when no
     * set to 'false' when the player is used for showing only one video at a
     * time
     */
    showPlaylist: true,
    /**
     * @cfg {Boolean} [showRecent=true]
     * Show the recently played button on the panel, 'true' when yes, 'false'
     * when no
     * set to 'false' when the player is used for showing only one video at a
     * time
     */
    showRecent: true,

    html: '<video controls class="video-js vjs-default-skin"></video>',

    initComponent: function (config) {
        var me = this;
        me.initConfig(config);

        var hidePlaylist = !me.showPlaylist;
        var hideRecent = !me.showRecent;
        var hideUrl = !me.showUrlLoad;

        Ext.apply(me, {
            currentVolume: me.initVolume,
            bodyStyle: {
                background: me.bodyBackgroundColor
            },
            dockedItems: [{
                xtype: 'VideoPlayerPlayTbar',
                dock: 'bottom',
                hidePlayList: hidePlaylist,
                hideRecent: hideRecent,
                hideUrl: hideUrl,
                listeners: {
                    clearrecent: 'onClearRecent'
                }
            },{
                xtype: 'VideoPlayerProgressTbar',
                dock: 'bottom',
                hidePlayList: hidePlaylist,
                hideRecent: hideRecent
            }]
        });

        me.callParent(arguments);
    }
});