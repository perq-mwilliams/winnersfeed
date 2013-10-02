(function($){
	var settings = {
		job: 80210,
		interval: 15000,
		jackpot: false,
		message: 'Sample Message Here',
		url: 'lib/updateFeed.php',
		limit: {
			local: 6,
			national: 9,
			jackpot: 1
		},
		promoType: 'local',
		image: {
			height: 35,
			width: 35,
			src: 'img/profile_placeholder.png'
		},
		populate: 'lib/populateFeed.php'
	};

	var methods = {
		init: function(options, callback) {
			return this.each(function(){
				if ($.isFunction(options)) {
					callback = options;
					options = null;
				}

				$.extend(settings, options);

				$('#localFeed, #nationalFeed').each(function(){
					$(this).css({
						'height': Math.round(Number(($(window).innerHeight() / 2)))
					});
				});

				// Initially populate National Feed
				$('#nationalFeed').winners('populate');

				// COMMENT THIS LINE TO PREVENT WINNERS FEED UPDATES
				setInterval($(this).winners('update'), settings.interval); // Update Feed

				$('body').on({
					winner: function(e, data){
						// console.log('Winner Event Data', data);						
						$(this).winners('notify', data);
					}
				});
				
				if ($.isFunction(callback)) {
					callback.call(this);
				}
			});
		},
		update: function(){
			return function(){
				var ids = [];
				var i = 0;
				$('.jquery-notific8-notification').each(function(){
					var id = $(this).attr('id');
					// var i = Number(id.replace('jquery-notific8-notification-', ''));
					var record = $(this).data('winnerId');
					
					if (record !== undefined) {
						ids[i++] = record;
					}
				});

				var prev = function(array){
					return Math.max.apply(null, array)
				};

				var previous = prev(ids);
				// console.log('previousId', previous);
				// console.log('Previous ID', previous);

				// Runs lib/updateFeed.php
				$.getJSON(settings.url, {
					job: settings.job,
					limiter: settings.limit,
					interval: settings.interval,
					previous: previous,
					localCount: $('.jquery-notific8-notification', '#localFeed').length
				}, function(data){
					if (data !== null && data !== undefined && data !== false){
						$('body').trigger('winner', data);
					} else {
						return false;
					}
				});

				// Show placeholder image for local feed if no entries
				if ($('#localFeed .jquery-notific8-notification').length == 0){
					$('#localFeed .feedContent').addClass('empty');
				} else {
					$('#localFeed .feedContent').removeClass('empty');
				}
			}
		},
		populate: function(){
			return this.each(function(){				
				$.getJSON(settings.populate, {job: settings.job, limiter: settings.limit.national}, function(data){
					if (data != null){
						return $.each(data, function(){
							$.each($(this), function(k, v){
								methods._populateList(v);
							});
						});
					} else {
						return false;
					}
				});
			});
		},
		notify: function(data){
			// console.log('winners data', data);
			return $.each(data, function(){
				methods._createWinner(this);
			});
		},
		_populateList: function(data){
			// Create notification heading and content
			var $selector = '#nationalFeed';
			var limit = settings.limit.national;
			var timestamp = data.timestamp;
			settings.jackpot = data.jackpot;
			
			var prize 		= '<div class="winner-username">' + data.username + ' <span>won</span></div> <div class="winner-prize">' + data.prize + '</div><div class="winner-userLocation">' + data.userLocation + '</div>';
			var $container 	= $('<div class="winner-container" />');
			var $content 	= $('<div class="winner-content" />');
			var $time 		= $('<div class="winner-timestamp" />');
			var $img 		= $('<img class="winner-image" />');

			$img.attr({
				'height': settings.image.height,
				'width' : settings.image.width
			});

			$time.html(data.timestamp);

			// console.log('random number chosen', data.random);

			$content.append(prize);
			$content.append($time);

			$container.append($img);
			$container.append($content);

			if (data.userImage){
				$img.attr('src', data.userImage);
			} else {
				$img.attr('src', settings.image.src);
			}

			settings.message = $container;
			
			// IF SETTINGS.JACKPOT:
			// Create notification with noteSettings.horizontalEdge: 'top'
			// console.log('jackpot', settings.jackpot);

			if (settings.jackpot !== null && settings.jackpot !== false){
				if ($($selector + ' .jquery-notific8-notification').length >= settings.limit.jackpot){
					$($selector + ' .jquery-notific8-notification.jackpot').remove();
				}

				$($selector + ' .jquery-notific8-notification:not(.jackpot)').first().remove();

				// $.notific8(settings.message, {
		  //           // sticky: false,
		  //           sticky: true,
		  //           // heading: 'JACKPOT!',
		  //           theme: 'ebony',
		  //           horizontalEdge: 'top',
		  //           verticalEdge: 'right',
		  //           zindex: 160000,
		  //           jackpot: true,
		  //           promoType: 'national'
				// });
				
				data.settings = {
					sticky: true,
					horizontalEdge: 'bottom',
					verticalEdge: 'right',
					theme: 'ebony',
					zindex: 150000,
					promoType: 'national'
				};

				data.message = $container;

				methods._buildNotification(data);

				$($selector + ' .jquery-notific8-notification.jackpot').css({
					height: Number($($selector).height() / limit)
				});

				$($selector + ' .jquery-notific8-notification.jackpot .winner-container').each(function(){
					$(this).css({
						position: 'absolute',
						top: '50%',
						marginTop: Number(-1 * $(this).height() / 2)
					});
				});

			} else { // IF !SETTINGS.JACKPOT:
				// $.logThis('notification count', $('.jquery-notific8-notification').length);
				if ($($selector + ' .jquery-notific8-notification:not(.jackpot)').length < limit ){
					// $.logThis('notific8 data', $.data('.notific8'));

					// $.notific8(settings.message, {
			  //           // sticky: false,
			  //           sticky: true,
			  //           // heading: data.username + ' won',
			  //           theme: 'ebony',
			  //           horizontalEdge: 'bottom',
			  //           verticalEdge: 'right',
			  //           zindex: 150000,
			  //           jackpot: false,
			  //           promoType: 'national'
					// });
					
					data.settings = {
						sticky: true,
						horizontalEdge: 'bottom',
						verticalEdge: 'right',
						theme: 'ebony',
						zindex: 150000,
						promoType: 'national'
					};

					data.message = $container;

					methods._buildNotification(data);

					$($selector + ' .jquery-notific8-notification:not(.jackpot)').css({
						height: Number($($selector).height() / limit)
					});

					$($selector + ' .jquery-notific8-notification:not(.jackpot) .winner-container').each(function(){
						$(this).css({
							position: 'absolute',
							top: '50%',
							marginTop: Number(-1 * $(this).height() / 2)
						});
					});
				} else {
					$($selector + ' .jquery-notific8-notification:not(.jackpot)').first().remove();
					// $.notific8(settings.message, {
			  //           // sticky: false,
			  //           sticky: true,
			  //           // heading: 'Winner!',
			  //           theme: 'ebony',
			  //           horizontalEdge: 'bottom',
			  //           verticalEdge: 'right',
			  //           zindex: 150000,
			  //           promoType: 'national'
					// });
					
					data.settings = {
						sticky: true,
						horizontalEdge: 'bottom',
						verticalEdge: 'right',
						theme: 'ebony',
						zindex: 150000,
						promoType: 'national'
					};

					data.message = $container;

					methods._buildNotification(data);
					
					$($selector + ' .jquery-notific8-notification:not(.jackpot)').css({
						height: Number($($selector).height() / limit)
					});

					$($selector + ' .jquery-notific8-notification:not(.jackpot) .winner-container').each(function(){
						// console.log( 'Winner Container Height', Number(-1 * $(this).height() / 2) );
						$(this).css({
							position: 'absolute',
							top: '50%',
							marginTop: Number(-1 * $(this).height() / 2)
						});
					});
				}
			}
		},
		_createWinner: function(data){
			// Create notification heading and content
			var timestamp = data.timestamp;
			var recordId = data.recordId;
			settings.jackpot = data.jackpot;

			// console.log('CreateWinner Data', data);

			var prize 		= '<div class="winner-username">' + data.username + ' <span>won</span></div> <div class="winner-prize">' + data.prize + '</div><div class="winner-userLocation">' + data.userLocation + '</div>';
			var $container 	= $('<div class="winner-container" />');
			var $content 	= $('<div class="winner-content" />');
			var $time 		= $('<div class="winner-timestamp" />');
			var $img 		= $('<img class="winner-image" />');

			$img.attr({
				'height': settings.image.height,
				'width' : settings.image.width
			});

			$time.html(data.timestamp);

			$content.append(prize);
			$content.append($time);

			$container.append($img);
			$container.append($content);

			if (data.userImage){
				$img.attr('src', data.userImage);
			} else {
				$img.attr('src', settings.image.src);
			}

			settings.message = $container;

			if (data.promoType == 'national' || data.multiple === true){
				var $selector = '#nationalFeed';
				var limit = settings.limit.national;
			} else {
				var $selector = '#localFeed';
				var limit = settings.limit.local;
			}

			// IF SETTINGS.JACKPOT:
			// Create notification with noteSettings.horizontalEdge: 'top'
			if (settings.jackpot !== null && settings.jackpot !== false){
				if ($($selector + ' .jquery-notific8-notification').length >= settings.limit.jackpot){
					$($selector + ' .jquery-notific8-notification.jackpot').remove();
				}

				$($selector + ' .jquery-notific8-notification:not(.jackpot)').first().remove();

				$.notific8(settings.message, {
		            // sticky: false,
		            sticky: true,
		            // heading: 'JACKPOT!',
		            theme: 'ebony',
		            horizontalEdge: 'top',
		            verticalEdge: 'right',
		            zindex: 160000,
		            jackpot: true,
		            promoType: data.promoType,
		            recordId: recordId
				});

				$($selector + ' .jquery-notific8-notification.jackpot').css({
					height: Number($($selector).height() / limit)
				});

				$($selector + ' .jquery-notific8-notification.jackpot .winner-container').each(function(){
					// console.log( 'Winner Container Height', Number(-1 * $(this).height() / 2) );
					$(this).css({
						position: 'absolute',
						top: '50%',
						marginTop: Number(-1 * $(this).height() / 2)
					});
				});

			} else { // IF !SETTINGS.JACKPOT:
				if ($($selector + ' .jquery-notific8-notification:not(.jackpot)').length < limit ){
					// $.logThis('notific8 data', $.data('.notific8'));

					$.notific8(settings.message, {
			            // sticky: false,
			            sticky: true,
			            // heading: data.username + ' won',
			            theme: 'ebony',
			            horizontalEdge: 'bottom',
			            verticalEdge: 'right',
			            zindex: 150000,
			            jackpot: false,
			            promoType: data.promoType,
			            recordId: recordId
					});

					$($selector + ' .jquery-notific8-notification:not(.jackpot)').css({
						height: Number($($selector).height() / limit)
					});

					$($selector + ' .jquery-notific8-notification:not(.jackpot) .winner-container').each(function(){
						$(this).css({
							position: 'absolute',
							top: '50%',
							marginTop: Number(-1 * $(this).height() / 2)
						});
						
						// console.log( 'Winner Container Height', Number(-1 * $(this).height() / 2) );
					});

					// console.log('Selector Height', $($selector).height());
					// console.log('This Height', Number($($selector).height() / limit));
				} else {
					$($selector + ' .jquery-notific8-notification:not(.jackpot)').first().remove();
					$.notific8(settings.message, {
			            // sticky: false,
			            sticky: true,
			            // heading: 'Winner!',
			            theme: 'ebony',
			            horizontalEdge: 'bottom',
			            verticalEdge: 'right',
			            zindex: 150000,
			            promoType: data.promoType,
			            recordId: recordId
					});
					
					$($selector + ' .jquery-notific8-notification:not(.jackpot)').css({
						height: Number($($selector).height() / limit)
					});

					$($selector + ' .jquery-notific8-notification:not(.jackpot) .winner-container').each(function(){
						// console.log( 'Winner Container Height', Number(-1 * $(this).height() / 2) );
						$(this).css({
							position: 'absolute',
							top: '50%',
							marginTop: Number(-1 * $(this).height() / 2)
						});
					});
					
					// console.log('Selector Height', $($selector).height());
					// console.log('This Height', Number($($selector).height() / limit));
				}
			}
		},
		_buildNotification: function(data) {
			// var data = $this.data('notific8');
			var notification = $('<div />');
			
			// console.log($('body').attr('data-notific8s'));
			if ($('body').attr('data-notific8s') == null){
				var num = 0;
			} else {
				var num = Number($('body').attr('data-notific8s'));
			}
            num++;
			
			notification.addClass('jquery-notific8-notification').addClass(data.settings.theme);

			if (data.settings.jackpot) {
				notification.addClass('jackpot');
			}

			notification.attr('id', 'jquery-notific8-notification-' + num);
			$('body').attr('data-notific8s', num);
			
			// check for a heading
			if (data.settings.hasOwnProperty('heading') && (typeof data.settings.heading == "string")) {
				notification.append($('<div />').addClass('jquery-notific8-heading').html(data.settings.heading));
			}
			
			// add the message
			notification.append($('<div />').addClass('jquery-notific8-message').html(data.message));

			// console.log('notification', notification);
			
			if (data.settings.promoType == 'national'){
				if (data.settings.jackpot == false){
					$('#nationalFeed .feedContent').append(notification);
				} else {
					$('#nationalFeed .feedContent').prepend(notification);
				}
			} else {
				$('.jquery-notific8-container.' + data.settings.verticalEdge + '.' + data.settings.horizontalEdge).append(notification);
			}

			notification.data('winnerId', data.recordId);
			
			// slide the message onto the screen
			notification.animate({width: 'show'}, {
			    duration: 'fast',
			    complete: function() {
                    // if (!data.settings.sticky) {
                    //     setTimeout(function() {
                    //         notification.animate({width: 'hide'}, {
                    //            duration: 'fast',
                    //            complete: function() {
                    //                notification.remove();
                    //            } 
                    //         });
                    //     }, data.settings.life);
                    // }
                    // data.settings = {};
                }
			});
		}
	};

	$.fn.winners = function(method)
	{
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call( arguments, 1 ));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.winners');
		}
	}
})(jQuery);