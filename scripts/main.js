jQuery(document).ready(function($) {

    // caching
    var $todoInput = $('.todo-input');
    var $todoList = $('.todo-list');

    // load from localstorage if exists
    if (localStorage.getItem("myTodos") !== null) {
        var myTodos = JSON.parse(localStorage.getItem("myTodos"));
        $.each(myTodos, function(index, val) {
            var template = '<li class="todo-item ' + val.status + '">' + val.name + '<img class="todo-item-delete" src="./media/img/close.png" alt="delete"></li>';
            $todoList.append(template);
        });
    }

    //initiate Sortable.min.js plugin
    var el = document.getElementById('todo-list');
    var sortable = new Sortable(el, {
        onEnd: function (evt) {
            saveTodos();
        }
    });

    // initial count of todos and completed todos
    countTodos();
    countCompletedTodos();

    $todoInput.keypress(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            var newTodo = $todoInput.val();
            if (newTodo !== '') {
                var template = '<li class="todo-item">' + newTodo + '<img class="todo-item-delete" src="./media/img/close.png" alt="delete"></li>';
                $todoList.append(template);
                $todoInput.val('');
                countTodos();
                saveTodos();
            }
        }
    });

    // delay for a better seperation of click and double-click event
    // (http://stackoverflow.com/questions/6330431/jquery-bind-double-click-and-single-click-separately)
    var clickDelay = 180, clicks = 0, timer = 0;

    $todoList
        .on('click', '.todo-item', function(event) {
            var $thisElem = $(this);
            clicks++;
            if(clicks === 1) {
                timer = setTimeout(function() {
                    $thisElem.toggleClass('closed');
                    countTodos();
                    countCompletedTodos();
                    saveTodos();
                    clicks = 0;         //after action performed, reset counter
                }, clickDelay);
            } else {
                clearTimeout(timer);    //prevent single-click action
                clicks = 0;             //after action performed, reset counter
            }
        })
        .on('dblclick', '.todo-item:not(.closed)', function(event) {
            event.preventDefault();
            var itemText = $(this).text();
            $(this).replaceWith('<form class="pure-form todo-form inline-todo-form"><input class="pure-input-1 inline-todo-input" type="text" value="' + itemText + '" autofocus></form>');
        })
        .on('click', '.todo-item-delete', function(event) {
            $(this).parent('.todo-item').remove();
            countCompletedTodos();
            saveTodos();
        })
        .on('keypress', '.inline-todo-input', function(event) {
            if (event.which == 13) {
                event.preventDefault();
                insertInlineTodo($(this));
            }
        })
        .on('focusout', '.inline-todo-input', function(event) {
            event.preventDefault();
            insertInlineTodo($(this));
        });

    $('.filter')
        .on('click', '.show-all', showAllTodos)
        .on('click', '.show-active', showActiveTodos)
        .on('click', '.show-completed', showCompletedTodos);

});

var insertInlineTodo = function ($this) {
    var newTodo = $this.val();
    if (newTodo !== '') {
        var template = '<li class="todo-item">' + newTodo + '<img class="todo-item-delete" src="./media/img/close.png" alt="delete"></li>';
        //nasty try catch because of strange focusout/blur behaviour: http://stackoverflow.com/questions/21926083/failed-to-execute-removechild-on-node
        try {
            $this.parent('.inline-todo-form').replaceWith(template);
        } catch(e) {
            //console.log(e);
        }
        countTodos();
        saveTodos();
    }
}

var countTodos = function () {
    var todoLength = $('.todo-item:not(.closed)').length;
    if (todoLength === 1) {
        $('.todo-counter').text(todoLength +  ' Item left');
    } else {
        $('.todo-counter').text(todoLength +  ' Items left');
    }
}

var countCompletedTodos = function () {
    var completedLength = $('.todo-item.closed').length;
    $('.completed-counter').text(completedLength +  ' completed');
}

var showAllTodos = function (event) {
    event.preventDefault();
    $('.filter a').removeClass('active');
    $(this).addClass('active');
    $('.todo-item').removeClass('hidden');
}

var showActiveTodos = function (event) {
    event.preventDefault();
    $('.filter a').removeClass('active');
    $(this).addClass('active');
    $('.todo-item:not(.closed)').removeClass('hidden');
    $('.todo-item.closed').addClass('hidden');
}

var showCompletedTodos = function (event) {
    event.preventDefault();
    $('.filter a').removeClass('active');
    $(this).addClass('active');
    $('.todo-item.closed').removeClass('hidden');
    $('.todo-item:not(.closed)').addClass('hidden');
}

var saveTodos = function (event) {
    var myTodos = {};
    var todoElements = $('.todo-list').find('.todo-item');
    $.each(todoElements, function(index, val) {
        var todoStatus = $(val).hasClass('closed') ? 'closed' : '';
        myTodos[index] = {
            name: $(val).text(),
            status: todoStatus
        }
    });
    localStorage.setItem('myTodos', JSON.stringify(myTodos));
}