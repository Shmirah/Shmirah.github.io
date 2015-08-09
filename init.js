$(function() {
	var data = [];
	function createTable() {
		$('#downloadDiv').hide();
		$('#schedule table').remove();
		data = [];
		var inindates = $('#in-in').datepicker('getDates').sort(function(a,b){return a.getTime() - b.getTime()});
		var start = $('#startDate').datepicker('getDate');
		var end = $('#endDate').datepicker('getDate');
		var names = [];
		$('#names input').each(function() {
			if($(this).val()) names.push($(this).val());
		});
		if(names.length && start && end) {
			function makeTable(fade) {
				$('#schedule table').remove();
				$('#schedule').append('<table class="table table-hover table-striped table-condensed" style="display: none;"><thead><tr><th>Date</th><th>Name</th><th>In-In Night</th></tr></thead>'+
				'<tbody id="tbody"></tbody></table>');
				data.push(['Date','Name','In-In Night']);
				var template = $('<tr><td></td><td></td><td></td>');
				var inindateCount = 0;
				var count = 0;
				var curr = start;
				var diff = Math.round((Date.parse(end) - Date.parse(start))/86400000);
				for(var i = 0;i <= diff;i++) {
					var row = template.clone();
					var excelRow = [curr.toDateString()];
					row.children().eq(0).text(curr.toDateString());
					if(inindates[inindateCount] && inindates[inindateCount].toDateString()==curr.toDateString()) {
						excelRow[2] = 'Yes';
						row.children().eq(2).text('Yes');
						inindateCount++;
					} else {
						excelRow[1] = names[count];
						row.children().eq(1).text(names[count]);
						if(++count===names.length) count = 0;
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
				$('#schedule').css({width: '500px', margin: '20px 25px'});
				setTimeout(function(names,inindates,start,end) {
					makeTable(true);
				}, 500, names, inindates, start, end);
			} else {
				makeTable();
			}
		}
	}
	$('#download').click(function() {
		if(data.length) {
			var a = document.createElement('a');
			var csvString = data.join('\r\n');
			var a = document.createElement('a');
			a.href = 'data:attachment/csv,' + encodeURIComponent(csvString);
			a.target = '_blank';
			a.download = 'ShmirahSchedule.csv';
			document.body.appendChild(a);
			a.click();
		}
	});
	$('.removeRow').click(function() {
		$(this).closest('div').remove();
		createTable();
	});
	$('.inputName').on('change',function() {
		createTable();
	});
	$('#addRow').click(function() {
		$('#names').append('<div class="input-group input-margin">'+
		'<input type="text" class="form-control inputName" placeholder="Jon Weinreich">'+
		'<span class="input-group-btn">'+
		'<button class="btn btn-danger btn-default removeRow">&times;</button>'+
		'</span>'+
		'</div>');
		$('.removeRow').off('click').click(function() {
			$(this).closest('div').remove();
			createTable();
		});
		$('.inputName').off('change').on('change',function() {
			createTable();
		});
	});
	$('#startDate').on('changeDate',function(e) {
		var dates = $('#in-in').datepicker('getDates');
		$('#in-in').datepicker('setStartDate',e.date);
		for(var i = 0;i < dates.length;i++) {
			if(dates[i]<e.date) {
				dates.splice(i,1);
				i--;
			}
		}
		$('#in-in').datepicker('setDates',dates);
		var date = new Date(e.date);
		date.setDate(date.getDate()+1);
		$('#endDate').datepicker('setStartDate',date);
		createTable();
	});
	$('#endDate').on('changeDate',function(e) {
		var dates = $('#in-in').datepicker('getDates');
		$('#in-in').datepicker('setEndDate',e.date);
		for(var i = 0;i < dates.length;i++) {
			if(dates[i]>e.date) {
				dates.splice(i,1);
				i--;
			}
		}
		$('#in-in').datepicker('setDates',dates);
		var date = new Date(e.date);
		date.setDate(date.getDate()-1);
		$('#startDate').datepicker('setEndDate',date);
		createTable();
	});
	$('#in-in').on('changeDate clearDate',function(e) {
		createTable();
	});
});