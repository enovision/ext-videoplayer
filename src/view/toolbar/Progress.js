/**
 * Created by jvandemerwe on 4-8-2017.
 */
Ext.define('VideoPlayer.view.toolbar.Progress', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'VideoPlayerProgressTbar',
    controller: 'VideoPlayerProgressController',

    requires: [
        'VideoPlayer.singleton.Util',
        'VideoPlayer.view.toolbar.ProgressController'
    ],

    hidePlaylist: false,
    hideUrl: false,
    hideRecent: false,

    videojs: null,

    initVolume: 0.2,

    defaults: {
        xtype: 'button'
    },

    initComponent: function () {
        var me = this;

        Ext.apply(me, {
            items: [{
                xtype: 'displayfield',
                reference: 'tPlayed',
                width: 60,
                value: vpUtil.formatTime(0)
            }, {
                xtype: 'slider',
                reference: 'pSlider',
                flex: 1,
                minValue: 0,
                increment: 1, /* seconds */
                value: 0,
                tipText: function (thumb) {
                    return vpUtil.formatTime(thumb.value);
                },
                listeners: {
                    dragstart: 'onPauseVideo',
                    drag: 'onProgressDrag'
                }
            }, {
                xtype: 'displayfield',
                reference: 'tTotal',
                width: 60,
                value: vpUtil.formatTime(0)
            }, {
                xtype: 'slider',
                reference: 'vSlider',
                minValue: 0,
                increment: 1,
                maxValue: 10,
                flex: .3,
                labelWidth: 40,
                value: me.initVolume * 10,
                listeners: {
                    drag: 'onVolumeChange',
                    dragend: 'onVolumeChanged'
                }
            }, {
                iconCls: vpUtil.getVolumeUp(),
                iconVolume: vpUtil.getVolumeUp(),
                iconMute: vpUtil.getVolumeOff(),
                listeners: {
                    click: 'onVolumeClicked'
                }
            }]
        });

        me.callParent();
    }
});