class queue {

    constructor() {
        this.elements = {};
        this.head = 0;
        this.tail = 0;
    }

    enqueue(element) {
        this.elements[this.tail] = element;
        this.tail++;
    }

    dequeue() {
        const item = this.elements[this.head];
        delete this.elements[this.head];
        this.head++;
        return item;
    }

    peek() {
        return this.elements[this.head];
    }

    lenght() {
        return this.tail - this.head;
    }
}

let customerQueue = new queue

function addTaskCustomerQueue(customerTask){
    customerQueue.enqueue(customerTask);
    //console.log(customerQueue.lenght()); for now only used for debugging
} 

function removeTaskCustomerQueue(){ // will presumably be run when a task is finished
    customerQueue.dequeue;
}