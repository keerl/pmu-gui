$(document).ready(function() {

  // Resize sidebar stuff so it doesn't have a scrollbar/ 
  $(window).resize(function() {
    $("#nodes").height(window.innerHeight-$("#controls").height()-50);
  });
  $("#nodes").height(window.innerHeight-$("#controls").height()-50);

  // Resize the canvas when the window is resized.
  window.addEventListener('resize', resizeCanvas, false);
  function resizeCanvas() {
      $("#network").find("canvas").attr('height', window.innerHeight-25);
      $("#network").find("canvas").attr('width', window.innerWidth-250);
      network.redraw();
      network.fit();
  }
    


  /***********  INITIALIZATION **************/
  $("#addNode").hide();
  $("#import").hide();

  var mode = 'view';

  var selectedNode = null;

  // Pre-saved networks
  var networks = {
                    "14" : {
                        nodes: [ [1,4],[0,2,3,4],[1],[1,2,4,6,8],[0,1],[3,10,11,12],[7,8],[3,6],[6,9,13],[3,8,10],[5,9],[5,12],[5,11,13],[8,12]]
                    },
                    "30" : {
                        nodes: [[1,2],[0,3,4,5],[0,3],[2,5,11],[1,6],[3,7,8,9,27],[4,5],[5,27],[5,9,10],[8,16,19,20,21],[8],[3,12,13,14,15],[11],[11,14],[11,13,17,22],[11,16],[9,15],[14,18],[17,19],[9,18],[9,21],[9,20,23],[14,23],[21,22,24],[23,25,26],[24],[24,27,28,29],[5,7,26],[26,29],[26,28]]
                    },
                    "57" : {
                        nodes: [[1,14,15,16],[0,2],[1,3,14],[2,4,5,17],[3,5],[3,4,6,7],[5,7,28],[5,6,8],[7,9,10,11,12,54],[8,11,50],[8,12,40,42],[8,9,12,15,16],[8,10,11,13,14,48],[12,14,45],[12,13,0,2,44],[0,11],[0,11],[3,18],[17,19],[18,20],[19,21],[20,22,37],[21,23],[22,24,25],[23,29],[23,26],[25,27],[26,28],[6,27,51],[24,30],[29,31],[30,32,33],[31],[31,34],[33,35],[34,36,39],[35,37,38],[36,21,43,47,48],[36,56],[35,55],[10,41,42,55],[40,55],[10,40],[37,44],[14,43],[13,46],[45,47],[37,46,48],[12,37,47,49],[48,50],[9,49],[28,52],[51,53],[52,54],[8,53],[39,40,41,56],[38,55]]
                    },
                    "118" : {
                        nodes: [[1,2],[0,11],[0,11,4],[4,10],[2,3,5,7,10],[4,6],[5,11],[4,8,29],[7,9],[8,0],[3,4,0,11,12],[1,2,6,10,13,15,116],[10,14],[11,14],[12,13,16,18],[11,16],[14,15,17,29,30,112],[16,18],[14,17,19,33],[18,20],[19,21],[20,22],[21,23,24,31],[22,69,71],[22,25,26],[24,29],[25,27,31,114],[26,28],[27,30],[7,16,25,37],[16,28,31],[22,26,30,112,113],[14,36],[18,35,36,42],[35,36],[33,34],[32,33,34,37,38,39],[29,36,64],[36,39],[36,38,40,41],[39,41],[39,40,48],[33,43],[42,44],[43,45,48],[44,46,47],[45,48,68],[45,48],[41,44,46,47,49,50,53,65],[48,56],[48,51,57],[50,52],[51,53],[48,52,54,55,58],[53,55,58],[53,54,56,57,58],[49,55],[50,55],[53,54,55,59,60,62],[58,60,61],[58,59,61,63],[59,60,65,66],[58,63],[60,62,64],[37,63,65,67],[48,61,64,66],[61,65],[64,68,115],[46,48,67,69,74,76],[23,68,70,73,74],[69,71,72],[23,70],[70],[69,74],[69,73,76,117],[76,117],[68,74,75,77,79],[76,78],[77,79],[76,78,80,95,96,97,98],[79,115],[76,82,95],[81,83,84],[82,84],[82,83,85,87,88],[84,86],[85],[84,88],[84,87,89,91],[88,90],[89,91],[88,90,92,93,99,101],[91,93],[91,92,94,95,99],[93,95],[79,81,93,94,96],[79,95],[79,99],[79,99],[91,93,97,98,100,102,103,105],[99,101],[92,100],[99,103,104,109],[99,102,104],[103,105,106,107],[99,104,106],[104,105],[104,108],[107,109],[102,108,110,111],[109],[109],[16,31],[31,114],[26,113],[67],[11],[74,75]]
                    }
                 };

  var nodesArray = networks["30"].nodes;

  $('#equationsWindow').modal({ show: false});





  /***********  VIS.JS NODE COLORS  **************/
  var colors = { 
        normal : {
                    background: "#67c482",
                    border: "#67c482",
                    highlight: {
                      background: '#67c482',
                      border: '#67c482'
                    }

                  },
        secondary : {
                      background: "#ffd758",
                      border: "#ffd758",
                      highlight: {
                        background: '#ffd758',
                        border: '#ffd758'
                      }
                    },
        selected : {
                    background: "#57a5ff",
                    border: "#57a5ff"
                    },
        pmu : {
                    background: "tomato",
                    border: "tomato"
                    },            
      };



  /***********  VIS.JS NETWORK SETUP  **************/

  // Initialize nodes & edges variables
  var nodes = new vis.DataSet([]);
  var edges = new vis.DataSet([]);

  // Define canvas location
  var container = document.getElementById('network');
  var data = {
    nodes: nodes,
    edges: edges
  };

  // Vis.js options. Physics stuff.
  var options = {
    autoResize: false,
    height: '100%',
    width: '100%',
    physics: {
      repulsion: {
        springLength: 40,
        damping: 0.2,
        centralGravity: 0.02,
        springConstant:0.04
      },
      solver: 'repulsion'
    }
  };

  // Create the network and attach to canvas
  var network = new vis.Network(container, data, options);


  // Generates the new sidebar content every time something changes in the network.
  function updateNodeList() {
    $("#nodes").html('');

    // Loop through each node
    $.each( nodesArray, function( key, value ) {

      var newNode = '<div class="btn-group nodeRow" role="group">';
      newNode += '<a href="#" class="btn';
      
      if(selectedNode == key) newNode += ' btn-primary';
      else newNode += ' btn-success';

      newNode += ' btn-sm disabled label" role="button" aria-disabled="true" id="' + key + '">' + key + '</a>';

      // Look through each connected node
      $.each( value, function( i, node ) {
        newNode += '<a href="#" class="btn btn-secondary btn-sm disabled" role="button" aria-disabled="true">' + node + '</a>';
      });

      newNode += '</div>';

      $("#nodes").append(newNode);
    });
  }

  // "Add Node" Button. 
  $("#addNode").click(function(){
    // Add empty array to master array.
    nodesArray.push([]);

    // Add it to the visual network
    nodes.add({
        id: nodesArray.length-1,
        label: " " + (nodesArray.length-1).toString(),
        font:{size:15, color: '#ffffff'},
        size:40,
        shape: 'circle', 
        color: colors.normal
    });

    // Regenerate sidebar ndoes.
    updateNodeList();
  });

  // Generates the visual network from the 
  // master array.
  function generateData() {
    $.each( nodesArray, function( key, value ) {

      // Create the node
      nodes.add({
          id: key,
          label: ' ' + key.toString(),
          font:{size:15, color: '#ffffff'},
          size:40,
          shape: 'circle',
          color: colors.normal
      });

      // Create the connection between each node
      $.each( value, function( i, node ) {
          edges.add({
              from: key,
              to: node,
              smooth: false,
              color: {
                color: "#000",
                highlight: '#000',
                hover: '#000'
              }
          });
      });
    });
  }
   
  generateData();
  updateNodeList();
  resizeCanvas();


  $("#pickNetwork").change(function() {

    nodesArray = networks[$("#pickNetwork").val()].nodes;

    selectedNode = null;
    pmuLocations = null;

    nodes = new vis.DataSet([]);
    edges = new vis.DataSet([]);

    data = {
      nodes: nodes,
      edges: edges
    };

    $("#status").hide();
    
    network = new vis.Network(container, data, options);
    generateData();
    updateNodeList();
    resizeCanvas();
    $("#nodes").height(window.innerHeight-$("#controls").height()-50);
    network.on('click', function(properties) {

    console.log('clicked');
      if(properties.nodes.length > 0) {
        //console.log(properties.nodes);
        selectNode(properties.nodes);
      }
      
    });

  });

  function selectNode(id) {
    clearPmuLocations();
    id = parseInt(id);
    if((mode == "edit") && (selectedNode != null)) {
      

      if(selectedNode == id) {
        // Clear previously selected stuff 
        network.unselectAll();
        nodes.update({id: selectedNode, color: colors.normal});
        $("#nodes").find(".btn-primary").removeClass('btn-primary').addClass('btn-success');
        $.each( nodesArray[selectedNode], function( i, node ) {
          nodes.update({id: node, color: colors.normal});
          $("#" + node).removeClass('btn-warning');
          $("#" + node).addClass('btn-success');
        });
        /////////////////////////////////////////////////////////////
        selectedNode = null;

      }
      else {
        if(($.inArray(id, nodesArray[selectedNode]) >= 0) || ($.inArray(selectedNode, nodesArray[id]) >= 0)) {

          var tmpNode1 = network.getConnectedEdges(selectedNode);
          var tmpNode2 = network.getConnectedEdges(id);

          $.each( tmpNode1, function( i, node1 ) {
            
              $.each( tmpNode2, function( j, node2 ) {
                if(node1 == node2)
                {
                  edges.remove({id:node1});
                  edges.remove({id:node2});
                }
              });
            
          });


          nodesArray[selectedNode].splice($.inArray(id, nodesArray[selectedNode]), 1);
          nodesArray[id].splice($.inArray(selectedNode, nodesArray[id]), 1);

          nodes.update({id: id, color: colors.normal});
          updateNodeList();

          // CLEAR
          $("#nodes").find(".btn-primary").removeClass('btn-primary').addClass('btn-success');
          $.each( nodesArray[selectedNode], function( i, node ) {
            nodes.update({id: node, color: colors.normal});
            $("#" + node).removeClass('btn-warning');
            $("#" + node).addClass('btn-success');
          });


          $("#" + selectedNode).removeClass('btn-success');
          $("#" + selectedNode).addClass('btn-primary');
          
          $.each( nodesArray[selectedNode], function( i, node ) {
            nodes.update({id: node, color: colors.secondary});
            $("#" + node).removeClass('btn-success');
            $("#" + node).addClass('btn-warning');
          });
        }
        else {
          nodesArray[selectedNode].push(id);
          nodesArray[id].push(selectedNode);
          updateNodeList();
          nodes.update({id: id, color: colors.secondary});
          edges.add({
              from: id,
              to: selectedNode,
              smooth: false,
              color: {
                color: "#000",
                highlight: '#000',
                hover: '#000'
              }
          });

          edges.add({
              from: selectedNode,
              to: id,
              smooth: false,
              color: {
                color: "#000",
                highlight: '#000',
                hover: '#000'
              }
          });

          // CLEAR
          $("#nodes").find(".btn-primary").removeClass('btn-primary').addClass('btn-success');
          $.each( nodesArray[selectedNode], function( i, node ) {
            nodes.update({id: node, color: colors.normal});
            $("#" + node).removeClass('btn-warning');
            $("#" + node).addClass('btn-success');
          });


          $("#" + selectedNode).removeClass('btn-success');
          $("#" + selectedNode).addClass('btn-primary');
          
          $.each( nodesArray[selectedNode], function( i, node ) {
            nodes.update({id: node, color: colors.secondary});
            $("#" + node).removeClass('btn-success');
            $("#" + node).addClass('btn-warning');
          });
        }
      }
    }
    else if(mode == "edit") {
      // Clear previously selected stuff 
      network.unselectAll();
      $("#nodes").find(".btn-primary").removeClass('btn-primary').addClass('btn-success');
      $.each( nodesArray[selectedNode], function( i, node ) {
        nodes.update({id: node, color: colors.normal});
        $("#" + node).removeClass('btn-warning');
        $("#" + node).addClass('btn-success');
      });
      /////////////////////////////////////////////////////////////

      // Change global selected node
      selectedNode = id;
      $("#" + selectedNode).removeClass('btn-success');
      $("#" + selectedNode).addClass('btn-primary');
      
      $.each( nodesArray[selectedNode], function( i, node ) {
        nodes.update({id: node, color: colors.secondary});
        $("#" + node).removeClass('btn-success');
        $("#" + node).addClass('btn-warning');
      });
      nodes.update({id: selectedNode, color: colors.selected});
      //network.selectNodes(selectedNode);
    }
    else {

      if((mode == "edit") && (selectedNode == null)) {
        $("#status").html("Select nodes to connect to.");
      }
      // Clear previously selected stuff 
      network.unselectAll();
      if(selectedNode) {
        nodes.update({id: selectedNode, color: colors.normal});
      }
      $("#nodes").find(".btn-primary").removeClass('btn-primary').addClass('btn-success');
      $.each( nodesArray[selectedNode], function( i, node ) {
        nodes.update({id: node, color: colors.normal});
        $("#" + node).removeClass('btn-warning');
        $("#" + node).addClass('btn-success');
      });
      /////////////////////////////////////////////////////////////

      // Change global selected node
      selectedNode = id;
      $("#" + selectedNode).removeClass('btn-success');
      $("#" + selectedNode).addClass('btn-primary');
      
      $.each( nodesArray[selectedNode], function( i, node ) {
        nodes.update({id: node, color: colors.secondary});
        $("#" + node).removeClass('btn-success');
        $("#" + node).addClass('btn-warning');
      });

      //network.selectNodes(selectedNode);
      nodes.update({id: selectedNode, color: colors.selected});
    }
  }

  network.on('click', function(properties) {

  console.log('clicked');
    if(properties.nodes.length > 0) {
      //console.log(properties.nodes);
      selectNode(properties.nodes);
    }
    
  });

  // $('html').keyup(function(e){
  //   if(selectedNode && (mode == "edit")) {
  //     if(e.keyCode == 46) {
  //         $.each( nodesArray, function( i, nodeRow ) {

  //           nodesArray[i] = $.grep(nodesArray[i], function(value) {
  //                             return value != selectedNode;
  //                           });
  //         });
  //         nodes.remove({id: selectedNode});
  //         nodesArray.splice(selectedNode, 1); 
  //         nodes.clear();
  //         generateData();
  //         updateNodeList();
  //     }
  //   }
  // });



  $(document.body).on('click', '.nodeRow', function() {
      selectNode($(this).find(".label").attr("id"));
  });

  $("#view").click(function(){
    mode = 'view';
    $("#view").removeClass('btn-secondary');
    $("#view").addClass('btn-success');
    $("#edit").removeClass('btn-success');
    $("#edit").addClass('btn-secondary');
    $("#status").html("&nbsp;");
    $("#addNode").hide();
    $(".optimize").show();
    $("#import").hide();
  });

  $("#edit").click(function(){
    mode = 'edit';
    $("#view").removeClass('btn-success');
    $("#view").addClass('btn-secondary');
    $("#edit").removeClass('btn-secondary');
    $("#edit").addClass('btn-success');
    $("#addNode").show();
    $(".optimize").hide();
    $("#import").show();
    clearPmuLocations();
    if(selectedNode) {
      var tmp = selectedNode;
      selectedNode = null;
      selectNode(tmp);
    }
    else {
      $("#status").html("Select a node");
    }
    
  });

  var pmuLocations = [];

  function genObjective(length) {
    var tmpString = '';
    for(var i=0; i<length; i++) {
      tmpString += 'x' + i;
      if(i != length-1) {
        tmpString += ' + ';
      }
    }
    return tmpString;
  }

  function genConstraints() {
    var tmpArray = [];
    var tmpString = '';

    $.each( nodesArray, function( i, node ) {
      $.each( nodesArray[i], function( j, node2 ) {
        tmpString += 'x' + node2 + ' + ';
      });

      tmpString += 'x' + i;
      tmpString += ' >= 1';
      tmpArray.push(tmpString);

      tmpString = '';
    });

    return tmpArray;
  }

  function genBounds(length) {
    var tmpString = '';
    for(var i=0; i<length; i++) {
      tmpString += 'x' + i + ' <= 1\n';
    }
    return tmpString;
  }

  function genDef(length) {
    var tmpString = '';
    for(var i=0; i<length; i++) {
      tmpString += 'x' + i + '\n';
    }
    return tmpString;
  }

  function compile(objective, constraints, bounds, definitions) {
      var tmpString = 'Minimize\n';
      tmpString += 'obj: ';
      tmpString += objective + '\n';
      tmpString += '\n';
      tmpString += 'Subject To\n';
      $.each( constraints, function( i, constraint ) {
        tmpString += 'lim_' + i + ':';
        tmpString += constraint + '\n';
      });
      tmpString += '\n';
      tmpString += 'Bounds\n';
      tmpString += bounds;
      tmpString += '\n';

      tmpString += 'General\n';
      tmpString += definitions;
      tmpString += '\n';
      tmpString += 'End';

      return tmpString;
  }

  function clearPmuLocations() {
    $.each( pmuLocations, function( i, node ) {
        nodes.update({id: node, color: colors.normal});
        $("#" + node).removeClass('btn-danger');
        console.log("removing: " + "#" + node);
    });
    
    pmuLocations = [];
  }

  $("#constraints").click(function() {
    $('#equationsWindow').modal('show');
    $("#constraintsBody").html('');
    $.each( genConstraints(), function( i, constraint ) {
      $("#constraintsBody").append('C' + i + ': `' + constraint + "`<br>");
    });
    var math = document.getElementById("constraintsBody");
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,math]);
  });

  $("#optimize").click(function() {
    console.log(JSON.stringify(nodesArray));
    // Clear previously selected stuff 
    network.unselectAll();
    if(selectedNode) {
      nodes.update({id: selectedNode, color: colors.normal});
      $("#nodes").find(".btn-primary").removeClass('btn-primary').addClass('btn-success');
      $.each( nodesArray[selectedNode], function( i, node ) {
        nodes.update({id: node, color: colors.normal});
        $("#" + node).removeClass('btn-warning');
        $("#" + node).addClass('btn-success');
      });
    }
    
    clearPmuLocations();

    var lp = glp_create_prob();
    glp_read_lp_from_string(lp, null, compile(genObjective(nodesArray.length), 
                                              genConstraints(), 
                                              genBounds(nodesArray.length), 
                                              genDef(nodesArray.length))
                                             );

    glp_scale_prob(lp, GLP_SF_AUTO);

    var smcp = new SMCP({presolve: GLP_ON});
    glp_simplex(lp, smcp);

    var iocp = new IOCP({presolve: GLP_ON});
    glp_intopt(lp, iocp);

    for(var i = 1; i <= glp_get_num_cols(lp); i++){
        if(glp_mip_col_val(lp, i)) {
          pmuLocations.push(parseInt(glp_get_col_name(lp, i).substr(1)));
          nodes.update({id: parseInt(glp_get_col_name(lp, i).substr(1)), color: colors.pmu});
          $("#" + parseInt(glp_get_col_name(lp, i).substr(1))).addClass('btn-danger');
        }
    }

    var SORI = 0;

    $.each( nodesArray, function( i, node ) {
      $.each( nodesArray[i], function( j, pmu ) {
        
        if($.inArray(nodesArray[i][j], pmuLocations) !== -1) {
          console.log(nodesArray[i][j])
          SORI++;
        }
      });
      if($.inArray(i, pmuLocations) !== -1) {
        SORI = SORI + 2;
      }
    });

    $("#status").html("<b>SORI: </b>" + SORI);
    $("#status").show();
    $("#nodes").height(window.innerHeight-$("#controls").height()-50);
    //$("#status").append("<br><b>ORC: </b>" + ORC);
  });

  $("#import").click(function() {
    $('#importWindow').modal('show');
  });

  $("#importBtn").click(function() {
    var importData = JSON.parse($('#importData').val());
    var tmpData = [];

    $.each( importData, function( i, node ) {
      tmpData[i] = [];
      $.each( importData[i], function( j, node2 ) {
        if(node2) {
          if(i != j) {
            tmpData[i].push(j);
          }
        } 
      });
    });


    nodesArray = tmpData;

    nodes.clear();
    generateData();
    updateNodeList();
    resizeCanvas();

    $('#importWindow').modal('hide');
  });
}); 