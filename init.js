$(function() {
	$('#calendars').datepicker({todayBtn: 'linked', todayHighlight: true});
	var $shown;
	var data = [];
	function createTable() {
		$('#downloadDiv').hide();
		$('#schedule table').remove();
		data = [];
		var ininDates = $('#in-in').datepicker('getDates').sort(function(a,b){return a.getTime() - b.getTime()});
		var rotationDates = $('#rotations').datepicker('getDates').sort(function(a,b){return a.getTime() - b.getTime()});
		var start = $('#startDate').datepicker('getDate');
		var end = $('#endDate').datepicker('getDate');
		var names = [];
		$('#names input[type="text"]').each(function() {
			if($(this).val()) names.push([$(this).val(),$(this).prev().find('input').is(':checked'),false]);
		});
		if(names.length && start && end) {
			function handleMultiple(count,type) {
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
				$('#schedule table').remove();
				$('#schedule').append('<table class="table table-hover table-striped table-condensed" style="display: none;"><thead><tr><th>Date</th><th>Name</th><th>In-In Night</th><th>Rotations</th></tr></thead>'+
				'<tbody id="tbody"></tbody></table>');
				data.push(['Date','Name','In-In Night','Rotations']);
				var template = $('<tr><td></td><td></td><td></td><td></td>');
				var inindateCount = 0;
				var rotationdateCount = 0;
				var count = 0;
				var miktzoi = [];
				var curr = start;
				var diff = Math.round((Date.parse(end) - Date.parse(start))/86400000);
				for(var i = 0;i <= diff;i++) {
					var row = template.clone();
					var excelRow = [curr.toDateString()];
					row.children().eq(0).text(curr.toDateString());
					if(ininDates[inindateCount] && ininDates[inindateCount].toDateString()==curr.toDateString()) {
						excelRow[2] = 'Yes';
						row.children().eq(2).text('Yes');
						inindateCount++;
					} else if(rotationDates[rotationdateCount] && rotationDates[rotationdateCount].toDateString()==curr.toDateString()) {
						excelRow[3] = 'Yes';
						row.children().eq(3).text('Yes');
						rotationdateCount++;
					} else {
						if(names[count][1] && curr.toDateString().substr(0,3)=='Tue') {
							var tempCount = handleMultiple(count,1);
							if(tempCount>-1) {
								miktzoi.push(tempCount);
								excelRow[1] = names[tempCount];
								row.children().eq(1).text(names[tempCount][0]);
							}
						} else if(names[count][2] && curr.toDateString().substr(0,3)=='Fri') {
							var tempCount = handleMultiple(count,2);
							if(tempCount>-1) {
								miktzoi.push(tempCount);
								excelRow[1] = names[tempCount];
								row.children().eq(1).text(names[tempCount][0]);
								names[tempCount][2] = true;
							}
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
									var tempCount = handleMultiple(count,1);
									if(tempCount>-1) {
										miktzoi.push(tempCount);
										excelRow[1] = names[tempCount];
										row.children().eq(1).text(names[tempCount][0]);
									}
								} else if(names[count][2] && curr.toDateString().substr(0,3)=='Fri') {
									var tempCount = handleMultiple(count,2);
									if(tempCount>-1) {
										miktzoi.push(tempCount);
										excelRow[1] = names[tempCount];
										row.children().eq(1).text(names[tempCount][0]);
										names[tempCount][2] = true;
									}
								} else {
									excelRow[1] = names[count];
									row.children().eq(1).text(names[count][0]);
									if(curr.toDateString().substr(0,3)=='Fri') names[count][2] = true;
									if(miktzoid) {
										miktzoi.splice(miktzoi.indexOf(countStart),1);
										count = countStart+1;
										if(count===names.length) count = 0;
										if(++count===names.length) count = 0;
									}
									else if(++count===names.length) count = 0;
								}
							}
						}
					}
					data.push(excelRow);
					$('#tbody').append(row);
					curr.setDate(curr.getDate()+1);
				}
				if(fade) {
					$('#downloadDiv').fadeIn('fast');
					$('#schedule table').fadeIn('fast');
				} else {
					$('#downloadDiv').show();
					$('#schedule table').show();
				}
			}
			if(!$('#schedule').width()) {
				var temp = $shown;
				if($shown) $shown.datepicker('hide');
				$('#schedule').css({width: '500px', margin: '20px 25px'});
				setTimeout(function($shown) {
					if($shown) $shown.datepicker('show');
					makeTable(true);
				}, 500, temp);
			} else {
				makeTable();
			}
		}
	}
	$('#download').click(function() {
		if(data.length) {
			var csvString = data.join('\r\n');
			var a = document.createElement('a');
			a.href = 'data:attachment/csv,' + encodeURIComponent(csvString);
			a.target = '_blank';
			a.download = 'ShmirahSchedule.csv';
			a.click();
			
			/*$('#schedule table').wrap('<div id="tableWrap">');
			var url='data:application/vnd.ms-excel,' + encodeURIComponent($('#tableWrap').html());
			$('#schedule table').unwrap();
			var a = document.createElement('a');
			a.href = url;
			a.download = 'ShmirahSchedule.xls';
			a.click();*/
		}
	});
	$('.removeRow').click(function() {
		$(this).closest('div').remove();
		createTable();
	});
	$('.inputName, .miktzoi').on('change',function() {
		createTable();
	});
	$('#addRow').click(function() {
		$('#names').append('<div class="input-group input-margin">'+
		'<span class="input-group-btn" data-toggle="buttons">'+
		'<label class="btn btn-primary"><input type="checkbox" class="miktzoi">Miktzoi</input></label>'+
		'</span>'+
		'<input type="text" class="form-control inputName" placeholder="Jon Weinreich">'+
		'<span class="input-group-btn">'+
		'<button class="btn btn-danger btn-default removeRow">&times;</button>'+
		'</span>'+
		'</div>');
		$('.removeRow').off('click').click(function() {
			$(this).closest('div').remove();
			createTable();
		});
		$('.inputName, .miktzoi').off('change').on('change',function() {
			createTable();
		});
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
	$('#startDate').on('changeDate',function(e) {
		setDateRange(e,$('#in-in'),true);
		setDateRange(e,$('#rotations'),true);
		createTable();
	});
	$('#endDate').on('changeDate',function(e) {
		setDateRange(e,$('#in-in'),false);
		setDateRange(e,$('#rotations'),false);
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
	$('#in-in').on('changeDate',function(e) {
		swapDates(e,$(this),$('#rotations'));
		createTable();
	});
	$('#rotations').on('changeDate',function(e) {
		swapDates(e,$(this),$('#in-in'));
		createTable();
	});
	$('#in-in, #rotations').on('clearDate',function(e) {
		createTable();
	});
	$('#startDate, #endDate').on('show',function() {
		$shown = $(this);
	}).on('hide',function() {
		$shown = false;
	})
});