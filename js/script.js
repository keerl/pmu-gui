$(document).ready(function() {


    $(window).resize(function() {
      $("#nodes").height(window.innerHeight-$("#controls").height()-50);
    });
    $("#nodes").height(window.innerHeight-$("#controls").height()-50);


    var mode = 'view';

    var selectedNode = null;

    var nodesArray = [
                  [1,2],
                  [3,2,0],
                  [0,1],
                  [1,4],
                  [3]
                ];


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
                      }
        };



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
          label: "Node " + (nodesArray.length-1).toString(),
          shape: 'box', 
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
    var options = {};
    var network = new vis.Network(container, data, options);

     $.each( nodesArray, function( key, value ) {
      nodes.add({
          id: key,
          label: "Node " + key,
          shape: 'box', 
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

    updateNodeList();

    function selectNode(id) {

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
    });

    $("#edit").click(function(){
      mode = 'edit';
      $("#view").removeClass('btn-success');
      $("#view").addClass('btn-secondary');
      $("#edit").removeClass('btn-secondary');
      $("#edit").addClass('btn-success');
      if(selectedNode) {
        var tmp = selectedNode;
        selectedNode = null;
        selectNode(tmp);
      }
      else {
        $("#status").html("Select a node");
      }
      
    });

  });