/**
 * Created by jvandemerwe on 4-8-2017.
 */
Ext.define('VideoPlayer.view.toolbar.PlayController', {
    extend: 'VideoPlayer.view.toolbar.TbarController',
    alias: 'controller.VideoPlayerPlayController',

    recentPlayed: 0,

    control: {
        '#': {
            onSetPlayBtn: 'onSetPlayBtn'
        }
    },

    init: function (view) {
        var me = this;
        me.callParent(view);

        me.recentPlayed = me.lookupReference('RecentPlayed');

    },

    onAfterrender: function (view) {
        // nothing here, yet
    },

    onSetPlayBtn: function(state) {
        var playBtn = this.lookupReference('btnPlay');

        var iconCls = state === 'play' ? playBtn.iconPlay : playBtn.iconPause;
        var tooltip = state === 'play' ? 'Click to Play' : 'Click to Pause';

        playBtn.setIconCls(iconCls)
            .setTooltip(tooltip);
    }
});