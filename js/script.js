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
                        background: '#57a5ff',
                        border: '#57a5ff'
                      }
                    },
          secondary : {
                        background: "#ffd758",
                        border: "#ffd758"
                      },
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
          id: nodesArray.length,
          label: "Node " + (nodesArray.length).toString(),
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
    var options = {
      autoResize: true,
      height: '100%',
      width: '100%'
    };
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
      if((mode == "edit") && (selectedNode != null)) {
        

        if(selectedNode == id) {
          // Clear previously selected stuff 
          network.unselectAll();
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
          
          console.log('sdfsdf');
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

        network.selectNodes(selectedNode);
      }
      else {

        if((mode == "edit") && (selectedNode == null)) {
          $("#status").html("Select nodes to connect to.");
        }
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

        network.selectNodes(selectedNode);
      }
    }

    network.on('click', function(properties) {
      if(properties.nodes) {
        console.log(properties.nodes);
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