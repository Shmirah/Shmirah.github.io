$(function() {
	var lang = 'en';
	$('#calendars').datepicker({todayBtn: 'linked', todayHighlight: true});
	$('#calendarsHE').datepicker({todayBtn: 'linked', todayHighlight: true, language: 'he'});
	var $shown;
	var $shownTemp
	var clearable;
	var data = [];
	Date.prototype.toDateString = function() {
		var date = this.toString();
		return date.substr(0,3)+' - '+date.substr(4,6)+', '+date.substr(11,4)
	}
	Date.prototype.toHebrewDateString = function() {
		return $.fn.datepicker.dates.he.days[this.getDay()]+' - '+('0'+this.getDate()).substr(-2)+' '+$.fn.datepicker.dates.he.monthsShort[this.getMonth()]+', '+(1900+this.getYear());
	}
	function createTable(forceFade) {
		$('#downloadDiv').hide();
		$('#schedule table').remove();
		data = [];
		var ininDates = $('#in-in').datepicker('getDates').sort(function(a,b){return a.getTime() - b.getTime()});
		var rotationDates = $('#rotations').datepicker('getDates').sort(function(a,b){return a.getTime() - b.getTime()});
		var start = $('#startDate').datepicker('getDate');
		var end = $('#endDate').datepicker('getDate');
		var inputs = [];
		var inputsCount = 0;
		$('#names > .tab-content > .tab-pane').each(function() {
			$(this).find('input[type="text"]').each(function() {
				if($(this).val()) {
					if(!inputs[inputsCount]) inputs[inputsCount] = [];
					inputs[inputsCount].push([$(this).val(),$(this).prev().find('input').is(':checked'),false]);
				}
			});
			inputsCount++;
		});
		if(inputs.length && start && end) {
			function handleMultiple(names,count,type) {
				var tempCount = count+1;
				if(count+1===names.length) tempCount = 0;
				while(names[tempCount][type]) {
					tempCount++;
					if(tempCount===names.length) tempCount = 0;
					if(tempCount===count) {
						tempCount = -1;
						break;
					}
				}
				return tempCount;
			}
			function makeTable(fade) {
				var allNames = [];
				for(var sets in inputs) {
					var col = [];
					var names = inputs[sets];
					var inindateCount = 0;
					var rotationdateCount = 0;
					var count = 0;
					var miktzoi = [];
					var curr = new Date(start);
					var diff = Math.round((Date.parse(end) - Date.parse(start))/86400000);
					for(var i = 0;i <= diff;i++) {
						if(ininDates[inindateCount] && ininDates[inindateCount].toDateString()==curr.toDateString()) {
							col.push('');
							inindateCount++;
						} else if(rotationDates[rotationdateCount] && rotationDates[rotationdateCount].toDateString()==curr.toDateString()) {
							col.push('');
							rotationdateCount++;
						} else {
							if(names[count][1] && curr.toDateString().substr(0,3)=='Tue') {
								var tempCount = handleMultiple(names,count,1);
								if(tempCount>-1) {
									miktzoi.push(tempCount);
									col.push(names[tempCount][0]);
								} else col.push('');
							} else if(names[count][2] && curr.toDateString().substr(0,3)=='Fri') {
								var tempCount = handleMultiple(names,count,2);
								if(tempCount>-1) {
									miktzoi.push(tempCount);
									col.push(names[tempCount][0]);
									names[tempCount][2] = true;
								} else col.push('');
							} else {
								var countStart = count;
								var miktzoid = miktzoi.indexOf(count)>-1;
								while(miktzoi.indexOf(count)>-1) {
									if(++count===names.length) count = 0;
									if(count===countStart) {
										countStart = -1;
										break;
									}
								}
								if(countStart>-1) {
									if(names[count][1] && curr.toDateString().substr(0,3)=='Tue') {
										var tempCount = handleMultiple(names,count,1);
										if(tempCount>-1) {
											miktzoi.push(tempCount);
											col.push(names[tempCount][0]);
										} else col.push('');
									} else if(names[count][2] && curr.toDateString().substr(0,3)=='Fri') {
										var tempCount = handleMultiple(names,count,2);
										if(tempCount>-1) {
											miktzoi.push(tempCount);
											col.push(names[tempCount][0]);
											names[tempCount][2] = true;
										} else col.push('');
									} else {
										col.push(names[count][0]);
										if(curr.toDateString().substr(0,3)=='Fri') names[count][2] = true;
										if(miktzoid) {
											miktzoi.splice(miktzoi.indexOf(countStart),1);
											count = countStart+1;
											if(count===names.length) count = 0;
											if(++count===names.length) count = 0;
										}
										else if(++count===names.length) count = 0;
									}
								} else col.push('');
							}
						}
						curr.setDate(curr.getDate()+1);
					}
					allNames.push(col);
				}
				$('#schedule table').remove();
				var excelRow = [];
				var table = '<table class="table table-hover table-striped table-condensed" style="display: none;">';
				if(lang==='en') {
					excelRow.push('Date');
					table += '<thead><tr><th>Date</th>';
				} else { //rotations, in-in nights
					excelRow.push('לילות בצריף','רוטציות');
					table += '<thead><tr><th class="he">רוטציות</th><th class="he">לילות בצריף</th>';
				}
				for(var i = 0;i < allNames.length;i++) {
					if(lang==='en') {
						excelRow.push('Name');
						table += '<th>Name</th>';
					} else {
						excelRow.push('שם');
						table += '<th class="he">שם</th>';
					}
				}
				if(lang==='en') {
					excelRow.push('In-In Night','Rotations');
					table += '<th>In-In Night</th><th>Rotations</th></tr></thead><tbody id="tbody">';
				} else{ //date
					excelRow.push('תאריך');
					table += '<th class="he">תאריך</th></tr></thead><tbody id="tbody">';
				}
				data.push(excelRow);
				var inindateCount = 0;
				var rotationdateCount = 0;
				var curr = new Date(start);
				var diff = Math.round((Date.parse(end) - Date.parse(start))/86400000);
				for(var i = 0;i <= diff;i++) {
					excelRow = [];
					if(lang==='en') {
						excelRow.push('"'+curr.toDateString()+'"');
						table += '<tr><td>'+curr.toDateString()+'</td>';
						for(var j = 0;j < allNames.length;j++) {
							excelRow.push('"'+allNames[j][i]+'"');
							table += '<td>'+allNames[j][i]+'</td>';
						}
					} else {
						table += '<tr>';
					}
					if(ininDates[inindateCount] && ininDates[inindateCount].toDateString()==curr.toDateString()) {
						if(lang==='en') {
							excelRow.push('Yes'); excelRow.push('');
							table += '<td>Yes</td><td></td>';
						} else {
							excelRow.push(''); excelRow.push('כן');
							table += '<td class="he">כן</td><td></td>';
						}
						inindateCount++;
					} else if(rotationDates[rotationdateCount] && rotationDates[rotationdateCount].toDateString()==curr.toDateString()) {
						if(lang==='en') {
							excelRow.push(''); excelRow.push('Yes');
							table += '<td></td><td>Yes</td>';
						} else {
							excelRow.push('כן'); excelRow.push('');
							table += '<td></td><td class="he">כן</td>';
						}
						rotationdateCount++;
					} else {
						excelRow.push(''); excelRow.push('');
						if(lang==='en') table += '<td></td><td></td>';
						else table += '<td></td><td></td>';
					}
					if(lang==='he') {
						for(var j = allNames.length-1;j >= 0;j--) {
							excelRow.push('"'+allNames[j][i]+'"');
							table += '<td>'+allNames[j][i]+'</td>';
						}
						excelRow.push('"'+curr.toHebrewDateString()+'"');
						table += '<td>'+curr.toHebrewDateString()+'</td>';
					}
					data.push(excelRow);
					table += '</tr>';
					curr.setDate(curr.getDate()+1);
				}
				table += '</tbody></table>';
				$('#schedule').append($(table));
				if(fade) {
					$('#downloadDiv').fadeIn('fast');
					$('#schedule table').fadeIn('fast');
				} else {
					$('#downloadDiv').show();
					$('#schedule table').show();
				}
			}
			if($('#options').width()>510) {
				if(clearable) return;
				if(!$shownTemp) $shownTemp = $shown;
				if($shown) $shown.datepicker('hide');
				$('#options').css('width',(50000/window.outerWidth)+'%');
				$('#schedule').css('margin','20px 25px');
				clearTimeout(clearable);
				clearable = setTimeout(function backToNorm($shown) {
					if($('#options').width()>510) return clearable = setTimeout(backToNorm,51,$shown);
					clearable = false;
					if($shown) $shown.datepicker('show');
					$shownTemp = false;
					$(window).off('resize').resize(function() {
						$('#options').css('width',(50000/window.outerWidth)+'%');
					})
					makeTable(true);
				}, 51, $shownTemp);
			} else {
				makeTable(forceFade);
			}
		}
	}
	$('#download').click(function() {
		if(data.length) {
			var csvString = data.join('\r\n');
			var a = document.createElement('a');
			a.href = 'data:attachment/csv,' + encodeURIComponent(csvString);
			a.target = '_blank';
			a.download = (lang==='en' ? 'ShmirahSchedule' : 'תוכניתשמירה')+'.csv';
			a.click();
			
			/*$('#schedule table').wrap('<div id="tableWrap">');
			var url='data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' + encodeURIComponent($('#tableWrap').html());
			$('#schedule table').unwrap();
			var a = document.createElement('a');
			a.href = url;
			a.download = (lang==='en' ? 'ShmirahSchedule' : 'תוכניתשמירה')+'.xls';
			a.click();*/
			
			/*var uri = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,'
			, template = '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta http-equiv="Content-Type" content="text/html;charset=windows-1252"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:Panes></x:Panes><x:DisplayGridlines /><x:Print><x:Gridlines /></x:Print></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>'
			, base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
			, format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
			var table = $('#schedule table')[0];
			var ctx = {worksheet: 'Worksheet', table: table.innerHTML}
			var a = document.createElement('a');
			a.href = uri + base64(format(template, ctx));
			a.download = (lang==='en' ? 'ShmirahSchedule' : 'תוכניתשמירה')+'.xls';
			a.click();*/
		}
	});
	function addNameInput($elem) {
		if(!$elem) $elem = $('.tab-pane.active');
		$elem.append('<div class="input-group input-margin">'+
		'<span class="input-group-btn" data-toggle="buttons">'+
		'<label class="btn btn-primary"><input type="checkbox" class="miktzoi" />Miktzoi</label>'+
		'</span>'+
		'<input type="text" class="form-control inputName" placeholder="Jon Weinreich" />'+
		'<span class="input-group-btn">'+
		'<button class="btn btn-danger btn-default removeRow">&times;</button>'+
		'</span>'+
		'</div>');
	}
	for(var i = 1;i <= 5;i++) {
		for(var j = 0;j < 5;j++) {
			addNameInput($('#tab'+i));
		}
	}
	$('.removeRow').click(function() {
		$(this).closest('div').remove();
		createTable();
	});
	$('.inputName, .miktzoi').on('change',function() {
		createTable();
	});
	$('#addRow').click(function() {
		addNameInput();
		$('.removeRow').off('click').click(function() {
			$(this).closest('div').remove();
			createTable();
		});
		$('.inputName, .miktzoi').off('change').on('change',function() {
			createTable();
		});
	});
	$('#addTab').click(function() {
		var us = parseInt($('ul.nav>li:nth-last-child(2)').text())+1;
		$(this).parent().before($('<li role="presentation"><a href="#tab'+us+'" aria-controls="tab'+us+'" role="tab" data-toggle="tab">'+us+'</a></li>'));
		$('.tab-content').append($('<div id="tab'+us+'" class="tab-pane fade" role="tabpanel"></div>'));
		for(var i = 0;i < 5;i++) {
			addNameInput($('#tab'+us));
		}
		$('.removeRow').off('click').click(function() {
			$(this).closest('div').remove();
			createTable();
		});
		$('.inputName, .miktzoi').off('change').on('change',function() {
			createTable();
		});
		$(this).blur();
		$('a[href="#tab'+us+'"]').click();
	});
	function setDateRange(event,$elem,start) {
		var dates = $elem.datepicker('getDates');
		$elem.datepicker(start ? 'setStartDate' : 'setEndDate',event.date);
		for(var i = 0;i < dates.length;i++) {
			if(start ? dates[i]<event.date : dates[i]>event.date) {
				dates.splice(i,1);
				i--;
			}
		}
		$elem.datepicker('setDates',dates);
	}
	$('#startDate, #startDateHE').on('changeDate',function(e) {
		setDateRange(e,$('#in-in'),true);
		setDateRange(e,$('#rotations'),true);
		setDateRange(e,$('#in-inHE'),true);
		setDateRange(e,$('#rotationsHE'),true);
		if(lang==='en' && this.id==='startDate') {
			if(e.date) $('#startDateHE').datepicker('setDate',e.date);
		} else if(lang==='he' && this.id==='startDateHE') {
			if(e.date) $('#startDate').datepicker('setDate',e.date);
		}
		createTable();
	});
	$('#endDate, #endDateHE').on('changeDate',function(e) {
		setDateRange(e,$('#in-in'),false);
		setDateRange(e,$('#rotations'),false);
		setDateRange(e,$('#in-inHE'),false);
		setDateRange(e,$('#rotationsHE'),false);
		if(lang==='en' && this.id==='endDate') {
			if(e.date) $('#endDateHE').datepicker('setDate',e.date);
		} else if(lang==='he' && this.id==='endDateHE') {
			if(e.date) $('#endDate').datepicker('setDate',e.date);
		}
		createTable();
	});
	function swapDates(event,$elem1,$elem2) {
		var dates = $elem2.datepicker('getDates');
		if(!dates.length || !event.date) return;
		var change = false;
		for(var i = 0;i < dates.length;i++) {
			if(dates[i].toDateString()==event.date.toDateString()) {
				dates.splice(i,1);
				change = true;
				break;
			}
		}
		if(!change) return;
		$elem2.datepicker('setDates',dates);
	}
	$('#in-in, #in-inHE').on('changeDate',function(e) {
		swapDates(e,$(this),$('#rotations'));
		swapDates(e,$(this),$('#rotationsHE'));
		if(lang==='en' && this.id==='in-in') {
			$('#in-inHE').datepicker('setDates',$(this).datepicker('getDates'));
		} else if(lang==='he' && this.id==='in-inHE') {
			$('#in-in').datepicker('setDates',$(this).datepicker('getDates'));
		}
		createTable();
	});
	$('#rotations, #rotationsHE').on('changeDate',function(e) {
		swapDates(e,$(this),$('#in-in'));
		swapDates(e,$(this),$('#in-inHE'));
		if(lang==='en' && this.id==='rotations') {
			$('#rotationsHE').datepicker('setDates',$(this).datepicker('getDates'));
		} else if(lang==='he' && this.id==='rotationsHE') {
			$('#rotations').datepicker('setDates',$(this).datepicker('getDates'));
		}
		createTable();
	});
	$('#in-in, #in-inHE, #rotations, #rotationsHE').on('clearDate',function(e) {
		createTable();
	});
	$('#startDate, #startDateHE, #endDate, #endDateHE').on('show',function() {
		$shown = $(this);
	}).on('hide',function() {
		$shown = false;
	});
	$('input[type="radio"]').change(function() {
		lang = this.id;
		if(lang==='en') {
			$('.miktzoi').parent().each(function() {
				this.childNodes[1].nodeValue = 'Miktzoi';
			});
			$('h1').text('Shmirah Scheduler');
			$('h4').eq(1).removeClass('he').text('Enter the names of who you want to schedule below:');
			$('h4').eq(2).removeClass('he').text('Choose the start and end dates:');
			$('h4').first().text('Download schedule as Excel file:');
			$('#addRow').html('<span class="glyphicon glyphicon-plus"></span> Add Another Name');
			$('#calendarsHE').hide();
			$('#calendars').show();
			$('#inlineHE').hide();
			$('#inline').show();
			if($('#options').width()<510) {
				$('#downloadDiv').fadeOut();
				$('#schedule table').fadeOut(function() {
					$('#schedule').css('margin','0');
					$('#download').text('Download');
					$('#download').parent().append($('#download'));
					$('#options').css('transition-timing-function','linear');
					$('#options').width('100%');
					setTimeout(function wait() {
						if($('#options').width()+5<window.outerWidth) return setTimeout(wait,51);
						$('#options').after($('#table'));
						$('#options').css('transition-timing-function','ease');
						$('#options').width((50000/window.outerWidth)+'%');
						$('#schedule').css('margin','20px 25px');
						setTimeout(function wait2() {
							if($('#options').width()>510) return setTimeout(wait2,51);
							createTable(true);
						}, 51);
					}, 51);
				});
			} else {
				$('#download').text('Download');
				$('#download').parent().append($('#download'));
				$('#options').after($('#table'));
				createTable();
			}
		} else {
			$('.miktzoi').parent().each(function() {
				this.childNodes[1].nodeValue = 'מקצועי';
			});
			$('h1').text('תוכנית שמירה');
			$('h4').eq(0).addClass('he').text(':הכנס את השמות של האנשים בסבב השמירה למלבן מתחת');
			$('h4').eq(1).addClass('he').text(':בחר את תאריך ההתחלה ותאריך הסוף');
			$('h4').last().text(':הורד את התוכנית כקובץ אקסל');
			$('#addRow').html('הוספת שם אחר <span class="glyphicon glyphicon-plus"></span>');
			$('#calendars').hide();
			$('#calendarsHE').show();
			$('#inline').hide();
			$('#inlineHE').show();
			if($('#options').width()<510) {
				$('#downloadDiv').fadeOut();
				$('#schedule table').fadeOut(function() {
					$('#schedule').css('margin','0');
					$('#download').text('להורדה');
					$('#download').parent().prepend($('#download'));
					$('#options').css('transition-timing-function','linear');
					$('#options').width('100%');
					setTimeout(function wait() {
						if($('#options').width()+5<window.outerWidth) return setTimeout(wait,51);
						$('#table').after($('#options'));
						$('#options').css('transition-timing-function','ease');
						$('#options').width((50000/window.outerWidth)+'%');
						$('#schedule').css('margin','20px 25px');
						setTimeout(function wait2() {
							if($('#options').width()>510) return setTimeout(wait2,51);
							createTable(true);
						}, 51);
					}, 51);
				});
			} else {
				$('#download').text('להורדה');
				$('#download').parent().prepend($('#download'));
				$('#table').after($('#options'));
				createTable();
			}
		}
	});
});
