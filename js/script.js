$(document).ready(function() {

    $(window).resize(function() {
      $("#nodes").height(window.innerHeight-$("#controls").height()-50);
    });
    $("#nodes").height(window.innerHeight-$("#controls").height()-50);

    window.addEventListener('resize', resizeCanvas, false);
    function resizeCanvas() {
        $("#mynetwork").find("canvas").attr('height', window.innerHeight-25);
        $("#mynetwork").find("canvas").attr('width', window.innerWidth-250);
        network.redraw();
        network.fit();
    }
    

    $("#addNode").hide();
    $("#import").hide();

    var mode = 'view';

    var selectedNode = null;

    var nodesArray = [[1,2],[0,3,4,5],[0,3],[2,5,11],[1,6],[3,7,8,9,27],[4,5],[5,27],[5,9,10],[8,16,19,20,21],[8],[3,12,13,14,15],[11],[11,14],[11,13,17,22],[11,16],[9,15],[14,18],[17,19],[9,18],[9,21],[9,20,23],[14,23],[21,22,24],[23,25,26],[24],[24,27,28,29],[5,7,26],[26,29],[26,28]];


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


    $('#equationsWindow').modal({ show: false});


    function updateNodeList() {
      $("#nodes").html('');
      $.each( nodesArray, function( key, value ) {
        var newNode = '<div class="btn-group nodeRow" role="group">';
        newNode += '<a href="#" class="btn';
        
        if(selectedNode == key)
        {
          newNode += ' btn-primary';
        }
        else {
          newNode += ' btn-success';
        }
        newNode += ' btn-sm disabled label" role="button" aria-disabled="true" id="' + key + '">' + key + '</a>';
        $.each( value, function( i, node ) {
          newNode += '<a href="#" class="btn btn-secondary btn-sm disabled" role="button" aria-disabled="true">' + node + '</a>';
        });

        newNode += '</div>';
        $("#nodes").append(newNode);
      });
    }

    $("#addNode").click(function(){
      nodesArray.push([]);
      nodes.add({
          id: nodesArray.length-1,
          label: " " + (nodesArray.length-1).toString(),
          font:{size:15, color: '#ffffff'},
          size:40,
          shape: 'circle', 
          color: colors.normal
      });
      updateNodeList();
    });

    



    // create an array with nodes
    var nodes = new vis.DataSet([]);

    // create an array with edges
    var edges = new vis.DataSet([]);

   
    // create a network
    var container = document.getElementById('mynetwork');
    var data = {
      nodes: nodes,
      edges: edges
    };
    var options = {
      autoResize: false,
      height: '100%',
      width: '100%',
      physics: {
        forceAtlas2Based: {
          avoidOverlap: 1,
          springLength: 45,
          damping: 0.2,
          centralGravity: 0.02
        },
        solver: 'forceAtlas2Based'
      }
    };
    var network = new vis.Network(container, data, options);

    function generateData() {
      $.each( nodesArray, function( key, value ) {
        nodes.add({
            id: key,
            label: ' ' + key.toString(),
            font:{size:15, color: '#ffffff'},
            size:40,
            shape: 'circle', /*
            shape: 'image',
            image: 'images/normal.jpg', */
            color: colors.normal

                
        });
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
      if(properties.nodes.length > 0) {
        //console.log(properties.nodes);
        selectNode(properties.nodes);
      }
      
    });

    $('html').keyup(function(e){
      if(selectedNode && (mode == "edit")) {
        if(e.keyCode == 46) {
            $.each( nodesArray, function( i, nodeRow ) {

              nodesArray[i] = $.grep(nodesArray[i], function(value) {
                                return value != selectedNode;
                              });
            });
            nodes.remove({id: selectedNode});
            nodesArray.splice(selectedNode, 1); 
            nodes.clear();
            generateData();
            updateNodeList();
        }
      }
    });



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
        $("#constraintsBody").append('`' + constraint + "`<br>");
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
      

      var start = new Date(); 
      var lp = glp_create_prob();
      glp_read_lp_from_string(lp, null, compile(genObjective(nodesArray.length), genConstraints(), genBounds(nodesArray.length), genDef(nodesArray.length)));

      glp_scale_prob(lp, GLP_SF_AUTO);

      var smcp = new SMCP({presolve: GLP_ON});
      glp_simplex(lp, smcp);

      var iocp = new IOCP({presolve: GLP_ON});
      glp_intopt(lp, iocp);

      console.log("obj: " + glp_mip_obj_val(lp));
      for(var i = 1; i <= glp_get_num_cols(lp); i++){
          console.log(glp_get_col_name(lp, i).substr(1)  + " = " + glp_mip_col_val(lp, i));
          if(glp_mip_col_val(lp, i)) {
            pmuLocations.push(parseInt(glp_get_col_name(lp, i).substr(1)));
            nodes.update({id: parseInt(glp_get_col_name(lp, i).substr(1)), color: colors.pmu});
            $("#" + parseInt(glp_get_col_name(lp, i).substr(1))).addClass('btn-danger');
          }
      }
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