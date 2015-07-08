simsoApp.service("confService", 
["pypyService", "$timeout", function(pypyService, $timeout) {
	this.cycles_per_ms = 1000000;
	this.duration_ms = 100;
	this.duration = this.duration_ms * this.cycles_per_ms;
	this.overhead_schedule = 0;
	this.overhead_activate = 0;
	this.overhead_terminate = 0;
	this.memory_access_time = 0; // Cache Model only
	this.tasks = [
		{'id': 1, 'type': 0, 'name': 'T1', 'activationDate': 0, 'activationDates':"-", 'period': 10, 'deadline': 10, 'wcet': 5, 'followedBy': -1},
		{'id': 2, 'type': 1, 'name': 'T2', 'activationDate': "-", 'activationDates':"-", 'period': "-", 'deadline': 8, 'wcet': 3, 'followedBy': -1},
		{'id': 3, 'type': 2, 'name': 'T3', 'activationDate': "-", 'period': "-", 'activationDates':"", 'deadline': 8, 'wcet': 1, 'followedBy': -1},
	];
	
	this.processors = [
		{'id' : 0, 'name': 'Proc', 'csOverhead': 0, 'clOverhead': 0, 'speed' : 1, 'caches' : []}, 
		{'id' : 1, 'name' : 'Proc2', 'csOverhead': 0, 'clOverhead': 0, 'speed' : 1, 'caches' : []}
	];
	
	this.caches = [
		{ 'id': 1, 'name': 'Cache 1', 'size': 0, 'acces_time': 0, 'miss_penalty': 0 }
	];
	
	// Array of {'name':fieldName, 'type':fieldType, 'from' : 'scheduler' | 'etm' }
	// The value is in this.tasks.fieldName
	this.taskAdditionalFields = [];
	this.procAdditionalFields = [];
	this.cleanAdditionalFields = function(fieldArray, source) {
		for(var i = 0; i < fieldArray.length; i++) {
			if(fieldArray[i].from == source) {
				fieldArray.splice(i, 1);
				i--;
			}
		}
	};
	
	
	// -- ETM conf
	this.etm = null;
	this.etm_list = [];
	this.etmAdditionalFields = []; // {'name':name,'type':pytype,'value':value}
	
	
	// -- Scheduler conf
	this.schedAdditionalFields = []; // {'name':name,'type':pytype,'value':value}
	this.scheduler_class = null; // if custom_shed == false
	this.scheduler_list = [];
	this.custom_sched = false;
	this.custom_sched_code = "";
	this.custom_sched_name = "Custom";
	
	this.window = {startDate: 0, endDate: 0};
	var othis = this;
	
	// Must be called when the tasks' additional fields are modified.
	this.onTaskFieldsChanged = function() {
		console.log("conf.onTaskFieldsChanged : not overrided yet.");	
	};
	
	// Must be called when the processors' additional fields are modified.
	this.onProcFieldsChanged = function() {
		console.log("conf.onProcFieldsChanged : not overrided yet.");	
	};
	
	this.allGanttItems = null;
	this.getAllGanttItems = function() {
		return $.merge(this.tasks.map(function(task) { 
				return {'id': task.id, 'name':task.name, 'type':'task' };
			}), this.processors.map(function(task) { 
				return {'id': task.id, 'name':task.name, 'type':'processor' };
		}));
	};
	
	// Creates a clone of the current configuration.
	this.clone = function() {
		return {
			cycles_per_ms: othis.cycles_per_ms,
			duration_ms: othis.duration_ms,
			duration: othis.duration,
			overhead_schedule: othis.overhead_schedule,
			overhead_activate: othis.overhead_activate,
			overhead_terminate: othis.overhead_terminate,
			ram_access_time: othis.ram_access_time,
			scheduler_class: othis.scheduler_class.name,
			taskAdditionalFields: othis.taskAdditionalFields.slice(),
			procAdditionalFields: othis.procAdditionalFields.slice(),
			schedAdditionalFields: othis.schedAdditionalFields.slice(),
			etmAdditionalFields: othis.etmAdditionalFields.slice(),
			etm: othis.etm.name,
			tasks: othis.tasks,
			processors: othis.processors,
			caches: othis.caches
		};
	};
	
	// Returns a string containing the current configuration in the JSON format.
	this.toJSON = function() {
		return JSON.stringify(this.clone());
	};
	
	// Loads the configuration from a JSON string.
	this.fromJSON = function(jsonStr) {
		var conf = JSON.parse(jsonStr);
		for(var key in conf) {
			switch(key) {
				case "taskAdditionalFields":
				case "procAdditionalFields":
				case "schedAdditionalFields":
				case "etmAdditionalFields":
				case "tasks":
				case "processors":
				case "caches":
					// We first delete all content.
					othis[key].splice(0, othis[key].length);
					break;
				case "etm":
					// ETM from name
					othis[key] = othis.etm_list.filter(function(value, index) {
						return value.name === conf[key];
					})[0];
					break;
				case "scheduler_class":
					// Class from name
					othis[key] = othis.scheduler_list.filter(function(value, index) {
						return value.name === conf[key];
					})[0];
					break;
				default:
					this[key] = conf[key]
			}
		}
		
		// We add the content in the arrays at the end of the digest cycle.
		// If we don't do that, the rows that were already present in the grid
		// won't change.
		$timeout(function() 
		{
			for(var key in conf) {
				switch(key) {
					case "taskAdditionalFields":
					case "procAdditionalFields":
					case "schedAdditionalFields":
					case "etmAdditionalFields":
					case "tasks":
					case "processors":
					case "caches":
						// Make a copy but keep the reference	
						othis[key].splice(0, othis[key].length);
						
						console.log("key = " + key);
						othis[key].splice(0, othis[key].length);
						for(var i = 0; i < conf[key].length; i++) {
							othis[key].push(conf[key][i]);
						}
	
						break;
				}
			}
		}, 0);
	
	};
}]);