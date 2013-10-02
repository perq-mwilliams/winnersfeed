/**
 * @author Will Steinmetz
 * 
 * jQuery notification plug-in inspired by the notification style of Windows 8
 * 
 * Copyright (c)2013, Will Steinmetz
 * Licensed under the BSD license.
 * http://opensource.org/licenses/BSD-3-Clause
 */
; (function ($) {
	var settings = {
		life: 10000,
		theme: 'ebony',
		sticky: false,
		verticalEdge: 'right',
		horizontalEdge: 'top',
		zindex: 1100,
		jackpot: false,
		promoType: 'local',
        recordId: 999999
	};
	
	var methods = {
		init: function(message, options) {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('notific8');
				
				// $.logThis('$this', $this);

				if (!data) {
					$this.data('notific8', {
						target: $this,
						settings: {},
						message: "",
                        recordId: options.recordId
					});
					data = $this.data('notific8');
				}
				data.message = message;

				
				// apply the options
				$.extend(data.settings, settings, options);
				
				// add the notification to the stack
				methods._buildNotification($this);
				
				$('body').data('notific8', data);
			});
		},
		objInit: function(message, options){
			return this.each(function() {
				var $this = $(this),
					data = $this.data('notific8');

                // // console.log('objInit Data', {
                //     message: message,
                //     options: options,
                //     this: $this.data()
                // });

				if (!data) {
					$this.data({
                        'notific8': {
                            target: $this,
                            settings: {},
                            message: ""
                        }
					});

					data = $this.data('notific8');
				}

				data.message = message;
                // // console.log('OPTIONS', options);
				
                // apply the options
				$.extend(data.settings, options);
                $this.settings = data.settings;
                
                // add the notification to the stack
                methods._buildNotification($this);                
				
                // $('body').data('notific8', data);
			});	
		},
		
        /**
         * Destroy the notification
         */
		destroy: function($this) {
			var data = $this.data('notific8');
			
			$(window).unbind('.notific8');
			$this.removeData('notific8');
		},
		
		/**
		 * Build the notification and add it to the screen's stack
		 */
		_buildNotification: function($this) {
			var data = $this.data('notific8'),
				notification = $('<div />'),
				num = Number($('body').attr('data-notific8s'));
            
            num++;

            // // console.log('_build $this.settings', $this.settings);
			
			notification.addClass('jquery-notific8-notification').addClass($this.settings.theme);

			if ($this.settings.jackpot) {
				notification.addClass('jackpot');
			}

			notification.attr('id', 'jquery-notific8-notification-' + num);
			$('body').attr('data-notific8s', num);
			
			// check for a heading
			if ($this.settings.hasOwnProperty('heading') && (typeof $this.settings.heading == "string")) {
				notification.append($('<div />').addClass('jquery-notific8-heading').html($this.settings.heading));
			}
			
			// check if the notification is supposed to be sticky
			if ($this.settings.sticky) {
			    var close = $('<div />').addClass('jquery-notific8-close').append(
                    $('<span />').html('close x')
                );
                close.click(function(event) {
                    notification.animate({width: 'hide'}, {
                        duration: 'fast',
                        complete: function() {
                            notification.remove();
                        }
                    });
                });
                notification.append(close);
                notification.addClass('sticky');
            }
			
			// add the message
			notification.append($('<div />').addClass('jquery-notific8-message').html(data.message));
            notification.data('winnerId', $this.settings.recordId);
            
            // add the notification to the stack
            if ($this.settings.promoType == 'local'){
                $('#localFeed .feedContent').removeClass('empty').append(notification);
            } else if ($this.settings.promoType == 'national'){
                if ($this.settings.jackpot == false){
                    $('#nationalFeed .feedContent').append(notification);
                } else {
                    $('#nationalFeed .feedContent').prepend(notification);
                }
            } else {
                $('.jquery-notific8-container.' + $this.settings.verticalEdge + '.' + $this.settings.horizontalEdge).append(notification);
            }

			
			// slide the message onto the screen
			notification.animate({width: 'show'}, {
			    duration: 'fast',
			    complete: function() {
                    if (!$this.settings.sticky) {
                        setTimeout(function() {
                            notification.animate({width: 'hide'}, {
                               duration: 'fast',
                               complete: function() {
                                   notification.remove();
                               } 
                            });
                        }, $this.settings.life);
                    }
                    $this.settings = {};
                }
			});
		},
        
        /**
         * Set up the configuration settings
         */
        configure: function(options) {
            $.extend(settings, options);
        },
        
        /**
         * Set up the z-index
         */
        zindex: function(zindex) {
            settings.zindex = zindex;
        }
	};
	
	// wrapper since this plug-in is called without selecting an item first
	$.notific8 = function(message, options) {
		switch (message) {
            case 'configure':
            case 'config':
                return methods.configure.apply(this, [options]);
            break;
            
            case 'zindex':
                return methods.zindex.apply(this, [options]);
            break;

            default:
                if (typeof options == undefined) {
                    options = {};
                }
                
                // make sure that the stack containers exist
                if ($('.jquery-notific8-container').size() === 0) {
                    $('body').attr('data-notific8s', 0);
                    $('body').append($('<div />').addClass('jquery-notific8-container').addClass('top').addClass('right'));
                    $('body').append($('<div />').addClass('jquery-notific8-container').addClass('top').addClass('left'));
                    $('body').append($('<div />').addClass('jquery-notific8-container').addClass('bottom').addClass('right'));
                    $('body').append($('<div />').addClass('jquery-notific8-container').addClass('bottom').addClass('left'));
                    $('.jquery-notific8-container').css('z-index', settings.zindex);
                }
                
                // make sure the edge settings exist
                if ((!options.hasOwnProperty('verticalEdge')) || ((options.verticalEdge.toLowerCase() != 'right') && (options.verticalEdge.toLowerCase() != 'left'))) {
                    options.verticalEdge = 'right';
                }
                if ((!options.hasOwnProperty('horizontalEdge')) || ((options.horizontalEdge.toLowerCase() != 'top') && (options.horizontalEdge.toLowerCase() != 'bottom'))) {
                    options.horizontalEdge = 'top';
                }
                options.verticalEdge = options.verticalEdge.toLowerCase();
                options.horizontalEdge = options.horizontalEdge.toLowerCase();
                
                //display the notification in the right corner
                $('.jquery-notific8-container.' + options.verticalEdge + '.' + options.horizontalEdge).notific8(message, options);
            break;
        }
	};
	
	// plugin setup
	$.fn.notific8 = function(message, options) {
        if (typeof message == "string") {
            return methods.init.apply(this, arguments);
        } else if (typeof message == 'object') {
        	return methods.objInit.apply(this, arguments);
        } else {
            $.error('jQuery.notific8 takes a string message as the first parameter');
        }
	};
})(jQuery);
