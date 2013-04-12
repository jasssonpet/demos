/* BEGIN */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define queue(Q, t) struct _queue Q; init_queue(&Q, sizeof(t));

struct _queue_node {
	struct _queue_node *next;
	void *data;
};

struct _queue{
	struct _queue_node *first;
	struct _queue_node *last;
	int _queue_node_data_size;
};

void enqueue(struct _queue *q, const void *value) {
	struct _queue_node *node = (struct _queue_node *) malloc(
			sizeof(struct _queue_node));
	node->data = malloc(q->_queue_node_data_size);
	memcpy(node->data, value, q->_queue_node_data_size);
	if (q->first == NULL) {
		q->first = q->last = node;
	} else {
		q->last->next = node;
		q->last = node;
	}
	node->next = NULL;
}

void dequeue(struct _queue *q, void *value) {
	struct _queue_node *tmp = q->first;
	memcpy(value, q->first->data, q->_queue_node_data_size);
	if (q->first == q->last) {
		q->first = q->last = NULL;
	} else {
		q->first = q->first->next;
	}
	free(tmp->data);
	free(tmp);
}

void init_queue(struct _queue *q, int size) {
	q->first = q->last = NULL;
	q->_queue_node_data_size = size;
}

int is_empty(struct _queue *q) {
	return q->first == NULL;
}
/* END */








void run_test(void) {
	int i;
	queue(Q, int);

	for (i = 0; i < 100; i++) {
		enqueue(&Q, &i);
	}

	while (!is_empty(&Q)) {
		dequeue(&Q, &i);
		printf("%d ", i);
	}
}

int main() {
	run_test();
	return 0;
}
