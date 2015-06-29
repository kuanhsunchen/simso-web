// Main controler of the conf service.
simsoControllers.controller('configurationCtrl', ['confService', 'logsService', 'pypyService', '$scope', function(confService, logsService, pypyService, $scope) {
	// conf is our model containing the configuration.
	$scope.conf = confService;
	$scope.pypyService = pypyService;
	$scope.pypyready = pypyService.pypyready;
	if (!$scope.pypyready) {
		$scope.pypyService.registerObserverCallback($scope, function() {
			$scope.$apply(function() {
				$scope.pypyready = true;
			});
		});
	}
	
	// Refreshes the python script (debug only)
	$scope.refresh_py = function() {
		for(var i = 0; i < pypyService.pythonFiles["files"].length; i++) {
			pypyService.vm.execfile(pypyService.pythonFiles["files"][i]);
		}
	};
	
	$scope.run = function() {
		var script = "configuration = Configuration();";
		var pyNumber = function(n) {
			return isNaN(n) ? 0 : n;
		};
		var escape = function(n) {
			return n == "-" ? "" : n;
		};
		var getType = function(task) {
			if(task.type == 0)
				return "\"Periodic\"";
			else if(task.type == 1)
				return "\"APeriodic\"";
			else if(task.type == 2)
				return "\"Sporadic\"";
		};
		var follower = function(task) {
			return task.followedBy == -1 ? "None" : task.followedBy;
		};
		// Global
		script += "configuration.duration = " + $scope.conf.duration + ";";
		script += "configuration.cycles_per_ms = " + $scope.conf.cycles_per_ms + ";";
		// Add tasks
		for (var i = 0; i < $scope.conf.tasks.length; i++) {
			var task = $scope.conf.tasks[i];
			script += "configuration.add_task(name=\"" + task.name
				+ "\", identifier=" + task.id
				+ ", abort_on_miss=" + (task.abortonmiss ? "True" : "False")
				+ ", activation_date=" + pyNumber(task.activationDate)
				+ ", list_activation_dates=[" + escape(task.activationDates) + "]"
				+ ", period=" + pyNumber(task.period)
				+ ", deadline=" + task.deadline
				+ ", task_type=" + getType(task)
				+ ", followed_by=" + follower(task)
				+ ", wcet=" + task.wcet + ");";
		}
		// Add processors
		for (var i = 0; i < $scope.conf.processors.length; i++) {
			var proc = $scope.conf.processors[i];
			script += "configuration.add_processor(name=\"" + proc.name + "\", identifier=" + proc.id + ");";
		}
		// Set scheduler
		script += "configuration.scheduler_info.clas = '" + $scope.conf.scheduler_class + "';";
		script += "run()";
		console.log(script);
		pypyService.vm.exec(script).then(function() {
			$scope.enableResults();
			$scope.conf.savedConf = $scope.conf.clone();
			$scope.conf.window.startDate = 0;
			$scope.conf.window.endDate = $scope.conf.duration_ms;
		});
	}
}]);


simsoControllers.controller('ConfigGeneralCtrl', ['confService', '$scope', function(confService, $scope) {
	$scope.conf = confService;
}]);

simsoControllers.controller('ConfigSchedulerCtrl', ['confService', '$scope', function(confService, $scope) {
	$scope.conf = confService;
}]);