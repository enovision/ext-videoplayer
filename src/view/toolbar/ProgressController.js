/**
 * Created by jvandemerwe on 4-8-2017.
 */
Ext.define('VideoPlayer.view.toolbar.ProgressController', {
    extend: 'VideoPlayer.view.toolbar.TbarController',
    alias: 'controller.VideoPlayerProgressController',

    init: function (view) {
        var me = this;
        me.callParent(view);

        me.pSlider = me.lookupReference('pSlider');
        me.vSlider = me.lookupReference('vSlider');
        me.tTotal = me.lookupReference('tTotal');
        me.tPlayed = me.lookupReference('tPlayed');
     },

     onAfterrender: function(view) {
        var me = this;
        me.lookupReference('pSlider').el.on('click', me.onProgressSliderClicked, me);
        me.lookupReference('vSlider').el.on('click', me.onVolumeSliderClicked, me);
     }
});