describe('uiGridCell', function () {
  var gridCell, $scope, $compile, $timeout, GridColumn, recompile, grid, uiGridConstants;

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_$compile_, $rootScope, _$timeout_, _GridColumn_, gridClassFactory, _uiGridConstants_) {
    $scope = $rootScope;
    $compile = _$compile_;
    $timeout = _$timeout_;
    GridColumn = _GridColumn_;
    uiGridConstants = _uiGridConstants_;


    $scope.grid = gridClassFactory.createGrid();


    $scope.col = new GridColumn({name: 'col1', cellClass: 'testClass'}, 0, $scope.grid);
    $scope.col.cellTemplate = '<div class="ui-grid-cell-contents">{{COL_FIELD}}</div>';

    //override getCellValue
    $scope.grid.getCellValue = function (row, col) {
      return 'val';
    };
    $scope.rowRenderIndex = 2;
    $scope.colRenderIndex = 2;

    recompile = function () {
      gridCell = angular.element('<div ui-grid-cell/>');

      $compile(gridCell)($scope);

      $scope.$digest();
    };

  }));

  describe('compile and link tests', function () {
    it('should have a value', inject(function () {
      recompile();
      expect(gridCell).toBeDefined();
      expect(gridCell.text()).toBe('val');
    }));

    it('should have the cellClass class', inject(function () {
      recompile();
      var displayHtml = gridCell.html();
      expect(gridCell.hasClass('testClass')).toBe(true);
    }));

    it('should get cellClass from function, and remove it when data changes', inject(function () {
      $scope.col.cellClass = function (grid, row, col, rowRenderIndex, colRenderIndex) {
        if (rowRenderIndex === 2 && colRenderIndex === 2) {
          if ( col.noClass ){
            return '';
          } else {
            return 'funcCellClass';
          }
        }
      };
      recompile();
      var displayHtml = gridCell.html();
      expect(gridCell.hasClass('funcCellClass')).toBe(true);
      
      $scope.col.noClass = true;
      $scope.grid.api.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
      expect(gridCell.hasClass('funcCellClass')).toBe(false);
    }));

    iit('should notice col changes and update cellClass', inject(function () {
      $scope.col.cellClass = function (grid, row, col, rowRenderIndex, colRenderIndex) {
        if (rowRenderIndex === 2 && colRenderIndex === 2) {
          if ( col.noClass ){
            return '';
          } else {
            return 'funcCellClass';
          }
        }
      };
      recompile();
      var displayHtml = gridCell.html();
      expect(gridCell.hasClass('funcCellClass')).toBe(true);
      
      $scope.col = new GridColumn({name: 'col2'}, 0, $scope.grid);
      $scope.$digest();
      expect(gridCell.hasClass('funcCellClass')).toBe(false);
    }));
  });

  it('should change a columns class when its uid changes', inject(function (gridUtil, $compile, uiGridConstants) {
    // Reset the UIDs (used by columns) so they're fresh and clean
    gridUtil.resetUids();

    // Set up a couple basic columns
    $scope.gridOptions = {
      columnDefs: [{ field: 'name', width: 100 }, { field: 'age', width: 50 }],
      data: [
        { name: 'Bob', age: 50 }
      ]
    };

    // Create a grid elements
    var gridElm = angular.element('<div ui-grid="gridOptions" style="width: 400px; height: 300px"></div>');

    // Compile the grid and attach it to the document, as the widths won't be right if it's unattached
    $compile(gridElm)($scope);
    document.body.appendChild(gridElm[0]);
    $scope.$digest();

    // Get the first column and its root column class
    var firstCol = $(gridElm).find('.ui-grid-cell').first();
    var firstHeaderCell = $(gridElm).find('.ui-grid-header-cell').first();
    var classRegEx = new RegExp('^' + uiGridConstants.COL_CLASS_PREFIX);
    var class1 = _(firstCol[0].classList).find(function(c) { return classRegEx.test(c); });

    // The first column should be 100px wide because we said it should be
    expect(firstCol.outerWidth()).toEqual(100);
    expect(firstHeaderCell.innerWidth()).toEqual(100, "header cell is 100px");

    // Now swap the columns in the column defs
    $scope.gridOptions.columnDefs = [{ field: 'age', width: 50 }, { field: 'name', width: 100 }];
    $scope.$digest();

    var firstColAgain = $(gridElm).find('.ui-grid-cell').first();
    var firstHeaderCellAgain = $(gridElm).find('.ui-grid-header-cell').first();
    var class2 = _(firstColAgain[0].classList).find(function(c) { return classRegEx.test(c); });

    // The column root classes should have changed
    expect(class2).not.toEqual(class1);

    // The first column should now be 50px wide
    expect(firstColAgain.outerWidth()).toEqual(50);
    expect(firstHeaderCellAgain.outerWidth()).toEqual(50);

    // ... and the last column should now be 100px wide
    var lastCol = $(gridElm).find('.ui-grid-cell').last();
    var lastHeaderCell = $(gridElm).find('.ui-grid-header-cell').last();
    expect(lastCol.outerWidth()).toEqual(100);
    expect(lastHeaderCell.outerWidth()).toEqual(100);

    angular.element(gridElm).remove();
  }));
});