var sw = 20,
    sh = 20,
    tr = 30,
    td = 30;

var snake = null;  //蛇的实例
var food = null;   //食物的实例
var game = null;  //游戏实例


function Square(x, y, classname) {
    this.x = x * sw;
    this.y = y * sh;
    this.class = classname;

    this.viewContent = document.createElement('div');//创建一个方块对应的DOM元素
    this.viewContent.className = this.class;
    this.parent = document.getElementById('snakeWrap');
}

Square.prototype.create = function () {
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw + 'px';
    this.viewContent.style.height = sh + 'px';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';

    this.parent.appendChild(this.viewContent);
};

Square.prototype.remove = function () {
    this.parent.removeChild(this.viewContent);
}

//snake

function Snake() {
    this.head = null;  //蛇头信息
    this.tail = null; //蛇尾
    this.pos = [];   //存储蛇身上每一个方块的位置

    this.directionNum = {
        left: {
            x: -1,
            y: 0,
            rotate: 0,   //蛇头在不同的方向进行旋转
        },
        right: {
            x: 1,
            y: 0,
            rotate: 0
        },
        up: {
            x: 0,
            y: -1,
            rotate: -90
        },
        down: {
            x: 0,
            y: 1,
            rotate: 90
        }
    }
}

Snake.prototype.init = function () {
    // 创建一个蛇头
    var snakeHead = new Square(2, 0, 'snakeHead');
    snakeHead.create();
    this.head = snakeHead;  //存储蛇头信息
    this.pos.push([2, 0]);  //存储蛇头位置

    // 创建蛇身体1
    var snakeBody1 = new Square(1, 0, 'snakeBody');
    snakeBody1.create();
    this.pos.push([1, 0]);

    // 蛇身体2
    var snakeBody2 = new Square(0, 0, 'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2;  //存储蛇尾的信息
    this.pos.push([0, 0]);


    //形成链表关系
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    // 给蛇添加一条属性，用来表示蛇的走向
    this.direction = this.directionNum.right;
};


Snake.prototype.getNextPos = function () {
    var nextPos = [
        this.head.x / sw + this.direction.x,
        this.head.y / sh + this.direction.y
    ]

    // 下个点是自己，表示撞到自己，游戏结束

    var selfCollied = false;
    this.pos.forEach(function (value) {
        if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
            selfCollied = true;  //为true代表撞到了自己
        }
    });
    if (selfCollied) {
        console.log('撞到自己了');

        this.strategies.die.call(this);
        return;
    }

    // 下个点是围墙，游戏结束

    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td - 1 || nextPos[1] > tr - 1) {
        console.log('撞墙了');
        this.strategies.die.call(this);
        return;
    }
    // 下个点是实物，吃
    // this.strategies.eat();
    if(food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]){
        // 这个条件成立，说明现在蛇头要走的下一个点是食物的点
        console.log('撞到食物了')
        this.strategies.eat.call(this);
        return;

    }

    // 下个点什么都不是，继续走
    this.strategies.move.call(this);

};

// 处理碰撞后要做的事
Snake.prototype.strategies = {
    move: function (format) {  //这个参数表示要不要删除最后一个方块
        // console.log('move');
        // console.log(this.head);
        // 创建新身体(在旧蛇头的位置)
        var newBody = new Square(this.head.x / sw, this.head.y / sh, 'snakeBody');
        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;

        this.head.remove();   //把旧蛇头从原来的位置删除
        newBody.create();

        // 创建一个新蛇头，(蛇头下一个要走的点)

        var newHead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, 'snakeHead');
        // 更新链表关系
        newHead.next = newBody;
        newHead.last = null;
        newBody.last = newHead;
        newHead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)';
        newHead.create();

        // 蛇身上的每一个方块的坐标也要更新
        this.pos.splice(0, 0,[this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y]);
        this.head = newHead;

        if (!format) {  //如果format的值为false，表示需要删除
            this.tail.remove();
            this.tail = this.tail.last;

            this.pos.pop();
        }

    },
    eat: function () {  //吃的方法
        this.strategies.move.call(this, true);
        createFood();
        game.score++;
    },
    
    die: function () {
        // console.log('die');
        game.over();
    }
}



snake = new Snake();
// snake.init();
// snake.getNextPos();

//创建食物
function createFood() {
    // 食物的随机坐标
    var x = null;
    var y = null;

    var include = true;//循环跳出的条件，true表示在蛇的身上(需要继续循环),false
    while (include) {
        x = Math.round(Math.random() * (td - 1));
        y = Math.round(Math.random() * (tr - 1));

        snake.pos.forEach(function (value) {
            if (x != value[0] && y != value[1]) {
                include = false;
            }
        });

    }

    // 生成食物
    food = new Square(x, y, 'food');
    food.pos = [x,y];  //存储生成食物的坐标，用于跟蛇头要走的下一个点做对比
    
    var foodDom = document.querySelector('.food');
    if(foodDom){
        foodDom.style.left=x*sw+'px';
        foodDom.style.top=y*sh+'px';
    }else{
        food.create();
    }
    
}
// createFood();


// 创建游戏逻辑
function Game() {
    this.timer = null;
    this.score = 0;
}

Game.prototype.init = function () {
    snake.init();
    // snake.getNextPos();

    createFood();


    document.onkeydown = function (ev) {
        if (ev.which === 37 && snake.direction != snake.directionNum.right) {
            snake.direction = snake.directionNum.left;
        } else if (ev.which === 38 && snake.direction != snake.directionNum.down) {
            snake.direction = snake.directionNum.up;
        } else if (ev.which === 39 && snake.direction != snake.directionNum.left) {
            snake.direction = snake.directionNum.right;
        } else if (ev.which === 40 && snake.direction != snake.directionNum.up) {
            snake.direction = snake.directionNum.down;
        }
    }

    this.start();

}
Game.prototype.start = function () {
    this.timer = setInterval(() => {
        snake.getNextPos();
    }, 200)
}
Game.prototype.pause = function(){
    clearInterval(this.timer);
}
Game.prototype.over = function(){
    clearInterval(this.timer);
    alert('周康杰的得分为：'+this.score+'分'+" "+'六六六啊！');

    // 游戏回到最初状态
    var snakeWrap = document.getElementById('snakeWrap');
    snakeWrap.innerHTML = '';

    snake = new Snake();
    game = new Game();


    var startBtnWrap = document.querySelector('.startBtn');
    startBtnWrap.style.display = 'block';
}


// 开启游戏

game = new Game();

// 当点击startBtn的时候才开始游戏
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function(){
    startBtn.parentNode.style.display = 'none';
    game.init();
}

// 点击暂停
var snakeWrap = document.getElementById('snakeWrap');
var pauseBtn = document.querySelector('.pauseBtn button');
snakeWrap.onclick = function(){
    game.pause();
    pauseBtn.parentNode.style.display = 'block';
}

pauseBtn.onclick = function(){
    game.start();
    pauseBtn.parentNode.style.display="none";
}




