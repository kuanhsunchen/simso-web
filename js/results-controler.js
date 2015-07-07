simsoControllers.controller('resultsCtrl', ['logsService', 'pypyService', '$scope', 'confService', 
function(logsService, pypyService, $scope, confService) {
	
	$scope.logService = logsService;
	$scope.vm = pypyService.vm;
	$scope.conf = confService;
	$scope.python = python;
	$scope.tmpWindow = {startDate: 0, endDate: $scope.conf.window.endDate};
	
	// Code viewer setup
	$scope.codeviewer = ace.edit("codeviewer");	
	$scope.codeviewer.setTheme("ace/theme/chrome");
	$scope.codeviewer.getSession().setMode("ace/mode/python");
	$scope.codeviewer.setReadOnly(true);
	if($scope.conf.custom_sched)
	{
		$scope.codeviewer.setValue($scope.conf.custom_sched_code);
	}
	else
	{
		readSchedulerFile($scope.conf.scheduler_class.name, function(code) {
			$scope.codeviewer.setValue(code);
		});
	}


	$scope.updateObservationWindow = function() {
		var windowStr = "(" + $scope.conf.window.startDate + ", " + $scope.conf.window.endDate + ")";
		$scope.vm.exec("change_observation_window(" + windowStr + ")");

	};
	// Ensures the startDate and endDate values are always valid.
	$scope.validateWindowStart = function() {
		$scope.conf.window.startDate = Math.max(0, Math.min($scope.tmpWindow.startDate, $scope.conf.window.endDate));
		$scope.tmpWindow.startDate = $scope.conf.window.startDate;
		$scope.updateObservationWindow();
	};
	
	$scope.validateWindowEnd = function() {
		$scope.conf.window.endDate = Math.max($scope.conf.window.startDate, Math.min($scope.tmpWindow.endDate, $scope.conf.duration_ms));
		$scope.tmpWindow.endDate = $scope.conf.window.endDate;		
		$scope.updateObservationWindow();
	};
}]);



