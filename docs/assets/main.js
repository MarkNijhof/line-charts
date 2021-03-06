
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _debois$elm_dom$DOM$className = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'className',
		_1: {ctor: '[]'}
	},
	_elm_lang$core$Json_Decode$string);
var _debois$elm_dom$DOM$scrollTop = A2(_elm_lang$core$Json_Decode$field, 'scrollTop', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$scrollLeft = A2(_elm_lang$core$Json_Decode$field, 'scrollLeft', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetTop = A2(_elm_lang$core$Json_Decode$field, 'offsetTop', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetLeft = A2(_elm_lang$core$Json_Decode$field, 'offsetLeft', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetHeight = A2(_elm_lang$core$Json_Decode$field, 'offsetHeight', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetWidth = A2(_elm_lang$core$Json_Decode$field, 'offsetWidth', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$childNodes = function (decoder) {
	var loop = F2(
		function (idx, xs) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (_p0) {
					return A2(
						_elm_lang$core$Maybe$withDefault,
						_elm_lang$core$Json_Decode$succeed(xs),
						A2(
							_elm_lang$core$Maybe$map,
							function (x) {
								return A2(
									loop,
									idx + 1,
									{ctor: '::', _0: x, _1: xs});
							},
							_p0));
				},
				_elm_lang$core$Json_Decode$maybe(
					A2(
						_elm_lang$core$Json_Decode$field,
						_elm_lang$core$Basics$toString(idx),
						decoder)));
		});
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$List$reverse,
		A2(
			_elm_lang$core$Json_Decode$field,
			'childNodes',
			A2(
				loop,
				0,
				{ctor: '[]'})));
};
var _debois$elm_dom$DOM$childNode = function (idx) {
	return _elm_lang$core$Json_Decode$at(
		{
			ctor: '::',
			_0: 'childNodes',
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Basics$toString(idx),
				_1: {ctor: '[]'}
			}
		});
};
var _debois$elm_dom$DOM$parentElement = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'parentElement', decoder);
};
var _debois$elm_dom$DOM$previousSibling = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'previousSibling', decoder);
};
var _debois$elm_dom$DOM$nextSibling = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'nextSibling', decoder);
};
var _debois$elm_dom$DOM$offsetParent = F2(
	function (x, decoder) {
		return _elm_lang$core$Json_Decode$oneOf(
			{
				ctor: '::',
				_0: A2(
					_elm_lang$core$Json_Decode$field,
					'offsetParent',
					_elm_lang$core$Json_Decode$null(x)),
				_1: {
					ctor: '::',
					_0: A2(_elm_lang$core$Json_Decode$field, 'offsetParent', decoder),
					_1: {ctor: '[]'}
				}
			});
	});
var _debois$elm_dom$DOM$position = F2(
	function (x, y) {
		return A2(
			_elm_lang$core$Json_Decode$andThen,
			function (_p1) {
				var _p2 = _p1;
				var _p4 = _p2._1;
				var _p3 = _p2._0;
				return A2(
					_debois$elm_dom$DOM$offsetParent,
					{ctor: '_Tuple2', _0: _p3, _1: _p4},
					A2(_debois$elm_dom$DOM$position, _p3, _p4));
			},
			A5(
				_elm_lang$core$Json_Decode$map4,
				F4(
					function (scrollLeft, scrollTop, offsetLeft, offsetTop) {
						return {ctor: '_Tuple2', _0: (x + offsetLeft) - scrollLeft, _1: (y + offsetTop) - scrollTop};
					}),
				_debois$elm_dom$DOM$scrollLeft,
				_debois$elm_dom$DOM$scrollTop,
				_debois$elm_dom$DOM$offsetLeft,
				_debois$elm_dom$DOM$offsetTop));
	});
var _debois$elm_dom$DOM$boundingClientRect = A4(
	_elm_lang$core$Json_Decode$map3,
	F3(
		function (_p5, width, height) {
			var _p6 = _p5;
			return {top: _p6._1, left: _p6._0, width: width, height: height};
		}),
	A2(_debois$elm_dom$DOM$position, 0, 0),
	_debois$elm_dom$DOM$offsetWidth,
	_debois$elm_dom$DOM$offsetHeight);
var _debois$elm_dom$DOM$target = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'target', decoder);
};
var _debois$elm_dom$DOM$Rectangle = F4(
	function (a, b, c, d) {
		return {top: a, left: b, width: c, height: d};
	});

var _elm_lang$core$Color$fmod = F2(
	function (f, n) {
		var integer = _elm_lang$core$Basics$floor(f);
		return (_elm_lang$core$Basics$toFloat(
			A2(_elm_lang$core$Basics_ops['%'], integer, n)) + f) - _elm_lang$core$Basics$toFloat(integer);
	});
var _elm_lang$core$Color$rgbToHsl = F3(
	function (red, green, blue) {
		var b = _elm_lang$core$Basics$toFloat(blue) / 255;
		var g = _elm_lang$core$Basics$toFloat(green) / 255;
		var r = _elm_lang$core$Basics$toFloat(red) / 255;
		var cMax = A2(
			_elm_lang$core$Basics$max,
			A2(_elm_lang$core$Basics$max, r, g),
			b);
		var cMin = A2(
			_elm_lang$core$Basics$min,
			A2(_elm_lang$core$Basics$min, r, g),
			b);
		var c = cMax - cMin;
		var lightness = (cMax + cMin) / 2;
		var saturation = _elm_lang$core$Native_Utils.eq(lightness, 0) ? 0 : (c / (1 - _elm_lang$core$Basics$abs((2 * lightness) - 1)));
		var hue = _elm_lang$core$Basics$degrees(60) * (_elm_lang$core$Native_Utils.eq(cMax, r) ? A2(_elm_lang$core$Color$fmod, (g - b) / c, 6) : (_elm_lang$core$Native_Utils.eq(cMax, g) ? (((b - r) / c) + 2) : (((r - g) / c) + 4)));
		return {ctor: '_Tuple3', _0: hue, _1: saturation, _2: lightness};
	});
var _elm_lang$core$Color$hslToRgb = F3(
	function (hue, saturation, lightness) {
		var normHue = hue / _elm_lang$core$Basics$degrees(60);
		var chroma = (1 - _elm_lang$core$Basics$abs((2 * lightness) - 1)) * saturation;
		var x = chroma * (1 - _elm_lang$core$Basics$abs(
			A2(_elm_lang$core$Color$fmod, normHue, 2) - 1));
		var _p0 = (_elm_lang$core$Native_Utils.cmp(normHue, 0) < 0) ? {ctor: '_Tuple3', _0: 0, _1: 0, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 1) < 0) ? {ctor: '_Tuple3', _0: chroma, _1: x, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 2) < 0) ? {ctor: '_Tuple3', _0: x, _1: chroma, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 3) < 0) ? {ctor: '_Tuple3', _0: 0, _1: chroma, _2: x} : ((_elm_lang$core$Native_Utils.cmp(normHue, 4) < 0) ? {ctor: '_Tuple3', _0: 0, _1: x, _2: chroma} : ((_elm_lang$core$Native_Utils.cmp(normHue, 5) < 0) ? {ctor: '_Tuple3', _0: x, _1: 0, _2: chroma} : ((_elm_lang$core$Native_Utils.cmp(normHue, 6) < 0) ? {ctor: '_Tuple3', _0: chroma, _1: 0, _2: x} : {ctor: '_Tuple3', _0: 0, _1: 0, _2: 0}))))));
		var r = _p0._0;
		var g = _p0._1;
		var b = _p0._2;
		var m = lightness - (chroma / 2);
		return {ctor: '_Tuple3', _0: r + m, _1: g + m, _2: b + m};
	});
var _elm_lang$core$Color$toRgb = function (color) {
	var _p1 = color;
	if (_p1.ctor === 'RGBA') {
		return {red: _p1._0, green: _p1._1, blue: _p1._2, alpha: _p1._3};
	} else {
		var _p2 = A3(_elm_lang$core$Color$hslToRgb, _p1._0, _p1._1, _p1._2);
		var r = _p2._0;
		var g = _p2._1;
		var b = _p2._2;
		return {
			red: _elm_lang$core$Basics$round(255 * r),
			green: _elm_lang$core$Basics$round(255 * g),
			blue: _elm_lang$core$Basics$round(255 * b),
			alpha: _p1._3
		};
	}
};
var _elm_lang$core$Color$toHsl = function (color) {
	var _p3 = color;
	if (_p3.ctor === 'HSLA') {
		return {hue: _p3._0, saturation: _p3._1, lightness: _p3._2, alpha: _p3._3};
	} else {
		var _p4 = A3(_elm_lang$core$Color$rgbToHsl, _p3._0, _p3._1, _p3._2);
		var h = _p4._0;
		var s = _p4._1;
		var l = _p4._2;
		return {hue: h, saturation: s, lightness: l, alpha: _p3._3};
	}
};
var _elm_lang$core$Color$HSLA = F4(
	function (a, b, c, d) {
		return {ctor: 'HSLA', _0: a, _1: b, _2: c, _3: d};
	});
var _elm_lang$core$Color$hsla = F4(
	function (hue, saturation, lightness, alpha) {
		return A4(
			_elm_lang$core$Color$HSLA,
			hue - _elm_lang$core$Basics$turns(
				_elm_lang$core$Basics$toFloat(
					_elm_lang$core$Basics$floor(hue / (2 * _elm_lang$core$Basics$pi)))),
			saturation,
			lightness,
			alpha);
	});
var _elm_lang$core$Color$hsl = F3(
	function (hue, saturation, lightness) {
		return A4(_elm_lang$core$Color$hsla, hue, saturation, lightness, 1);
	});
var _elm_lang$core$Color$complement = function (color) {
	var _p5 = color;
	if (_p5.ctor === 'HSLA') {
		return A4(
			_elm_lang$core$Color$hsla,
			_p5._0 + _elm_lang$core$Basics$degrees(180),
			_p5._1,
			_p5._2,
			_p5._3);
	} else {
		var _p6 = A3(_elm_lang$core$Color$rgbToHsl, _p5._0, _p5._1, _p5._2);
		var h = _p6._0;
		var s = _p6._1;
		var l = _p6._2;
		return A4(
			_elm_lang$core$Color$hsla,
			h + _elm_lang$core$Basics$degrees(180),
			s,
			l,
			_p5._3);
	}
};
var _elm_lang$core$Color$grayscale = function (p) {
	return A4(_elm_lang$core$Color$HSLA, 0, 0, 1 - p, 1);
};
var _elm_lang$core$Color$greyscale = function (p) {
	return A4(_elm_lang$core$Color$HSLA, 0, 0, 1 - p, 1);
};
var _elm_lang$core$Color$RGBA = F4(
	function (a, b, c, d) {
		return {ctor: 'RGBA', _0: a, _1: b, _2: c, _3: d};
	});
var _elm_lang$core$Color$rgba = _elm_lang$core$Color$RGBA;
var _elm_lang$core$Color$rgb = F3(
	function (r, g, b) {
		return A4(_elm_lang$core$Color$RGBA, r, g, b, 1);
	});
var _elm_lang$core$Color$lightRed = A4(_elm_lang$core$Color$RGBA, 239, 41, 41, 1);
var _elm_lang$core$Color$red = A4(_elm_lang$core$Color$RGBA, 204, 0, 0, 1);
var _elm_lang$core$Color$darkRed = A4(_elm_lang$core$Color$RGBA, 164, 0, 0, 1);
var _elm_lang$core$Color$lightOrange = A4(_elm_lang$core$Color$RGBA, 252, 175, 62, 1);
var _elm_lang$core$Color$orange = A4(_elm_lang$core$Color$RGBA, 245, 121, 0, 1);
var _elm_lang$core$Color$darkOrange = A4(_elm_lang$core$Color$RGBA, 206, 92, 0, 1);
var _elm_lang$core$Color$lightYellow = A4(_elm_lang$core$Color$RGBA, 255, 233, 79, 1);
var _elm_lang$core$Color$yellow = A4(_elm_lang$core$Color$RGBA, 237, 212, 0, 1);
var _elm_lang$core$Color$darkYellow = A4(_elm_lang$core$Color$RGBA, 196, 160, 0, 1);
var _elm_lang$core$Color$lightGreen = A4(_elm_lang$core$Color$RGBA, 138, 226, 52, 1);
var _elm_lang$core$Color$green = A4(_elm_lang$core$Color$RGBA, 115, 210, 22, 1);
var _elm_lang$core$Color$darkGreen = A4(_elm_lang$core$Color$RGBA, 78, 154, 6, 1);
var _elm_lang$core$Color$lightBlue = A4(_elm_lang$core$Color$RGBA, 114, 159, 207, 1);
var _elm_lang$core$Color$blue = A4(_elm_lang$core$Color$RGBA, 52, 101, 164, 1);
var _elm_lang$core$Color$darkBlue = A4(_elm_lang$core$Color$RGBA, 32, 74, 135, 1);
var _elm_lang$core$Color$lightPurple = A4(_elm_lang$core$Color$RGBA, 173, 127, 168, 1);
var _elm_lang$core$Color$purple = A4(_elm_lang$core$Color$RGBA, 117, 80, 123, 1);
var _elm_lang$core$Color$darkPurple = A4(_elm_lang$core$Color$RGBA, 92, 53, 102, 1);
var _elm_lang$core$Color$lightBrown = A4(_elm_lang$core$Color$RGBA, 233, 185, 110, 1);
var _elm_lang$core$Color$brown = A4(_elm_lang$core$Color$RGBA, 193, 125, 17, 1);
var _elm_lang$core$Color$darkBrown = A4(_elm_lang$core$Color$RGBA, 143, 89, 2, 1);
var _elm_lang$core$Color$black = A4(_elm_lang$core$Color$RGBA, 0, 0, 0, 1);
var _elm_lang$core$Color$white = A4(_elm_lang$core$Color$RGBA, 255, 255, 255, 1);
var _elm_lang$core$Color$lightGrey = A4(_elm_lang$core$Color$RGBA, 238, 238, 236, 1);
var _elm_lang$core$Color$grey = A4(_elm_lang$core$Color$RGBA, 211, 215, 207, 1);
var _elm_lang$core$Color$darkGrey = A4(_elm_lang$core$Color$RGBA, 186, 189, 182, 1);
var _elm_lang$core$Color$lightGray = A4(_elm_lang$core$Color$RGBA, 238, 238, 236, 1);
var _elm_lang$core$Color$gray = A4(_elm_lang$core$Color$RGBA, 211, 215, 207, 1);
var _elm_lang$core$Color$darkGray = A4(_elm_lang$core$Color$RGBA, 186, 189, 182, 1);
var _elm_lang$core$Color$lightCharcoal = A4(_elm_lang$core$Color$RGBA, 136, 138, 133, 1);
var _elm_lang$core$Color$charcoal = A4(_elm_lang$core$Color$RGBA, 85, 87, 83, 1);
var _elm_lang$core$Color$darkCharcoal = A4(_elm_lang$core$Color$RGBA, 46, 52, 54, 1);
var _elm_lang$core$Color$Radial = F5(
	function (a, b, c, d, e) {
		return {ctor: 'Radial', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Color$radial = _elm_lang$core$Color$Radial;
var _elm_lang$core$Color$Linear = F3(
	function (a, b, c) {
		return {ctor: 'Linear', _0: a, _1: b, _2: c};
	});
var _elm_lang$core$Color$linear = _elm_lang$core$Color$Linear;

//import Result //

var _elm_lang$core$Native_Date = function() {

function fromString(str)
{
	var date = new Date(str);
	return isNaN(date.getTime())
		? _elm_lang$core$Result$Err('Unable to parse \'' + str + '\' as a date. Dates must be in the ISO 8601 format.')
		: _elm_lang$core$Result$Ok(date);
}

var dayTable = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var monthTable =
	['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


return {
	fromString: fromString,
	year: function(d) { return d.getFullYear(); },
	month: function(d) { return { ctor: monthTable[d.getMonth()] }; },
	day: function(d) { return d.getDate(); },
	hour: function(d) { return d.getHours(); },
	minute: function(d) { return d.getMinutes(); },
	second: function(d) { return d.getSeconds(); },
	millisecond: function(d) { return d.getMilliseconds(); },
	toTime: function(d) { return d.getTime(); },
	fromTime: function(t) { return new Date(t); },
	dayOfWeek: function(d) { return { ctor: dayTable[d.getDay()] }; }
};

}();
var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$core$Date$millisecond = _elm_lang$core$Native_Date.millisecond;
var _elm_lang$core$Date$second = _elm_lang$core$Native_Date.second;
var _elm_lang$core$Date$minute = _elm_lang$core$Native_Date.minute;
var _elm_lang$core$Date$hour = _elm_lang$core$Native_Date.hour;
var _elm_lang$core$Date$dayOfWeek = _elm_lang$core$Native_Date.dayOfWeek;
var _elm_lang$core$Date$day = _elm_lang$core$Native_Date.day;
var _elm_lang$core$Date$month = _elm_lang$core$Native_Date.month;
var _elm_lang$core$Date$year = _elm_lang$core$Native_Date.year;
var _elm_lang$core$Date$fromTime = _elm_lang$core$Native_Date.fromTime;
var _elm_lang$core$Date$toTime = _elm_lang$core$Native_Date.toTime;
var _elm_lang$core$Date$fromString = _elm_lang$core$Native_Date.fromString;
var _elm_lang$core$Date$now = A2(_elm_lang$core$Task$map, _elm_lang$core$Date$fromTime, _elm_lang$core$Time$now);
var _elm_lang$core$Date$Date = {ctor: 'Date'};
var _elm_lang$core$Date$Sun = {ctor: 'Sun'};
var _elm_lang$core$Date$Sat = {ctor: 'Sat'};
var _elm_lang$core$Date$Fri = {ctor: 'Fri'};
var _elm_lang$core$Date$Thu = {ctor: 'Thu'};
var _elm_lang$core$Date$Wed = {ctor: 'Wed'};
var _elm_lang$core$Date$Tue = {ctor: 'Tue'};
var _elm_lang$core$Date$Mon = {ctor: 'Mon'};
var _elm_lang$core$Date$Dec = {ctor: 'Dec'};
var _elm_lang$core$Date$Nov = {ctor: 'Nov'};
var _elm_lang$core$Date$Oct = {ctor: 'Oct'};
var _elm_lang$core$Date$Sep = {ctor: 'Sep'};
var _elm_lang$core$Date$Aug = {ctor: 'Aug'};
var _elm_lang$core$Date$Jul = {ctor: 'Jul'};
var _elm_lang$core$Date$Jun = {ctor: 'Jun'};
var _elm_lang$core$Date$May = {ctor: 'May'};
var _elm_lang$core$Date$Apr = {ctor: 'Apr'};
var _elm_lang$core$Date$Mar = {ctor: 'Mar'};
var _elm_lang$core$Date$Feb = {ctor: 'Feb'};
var _elm_lang$core$Date$Jan = {ctor: 'Jan'};

//import Maybe, Native.List //

var _elm_lang$core$Native_Regex = function() {

function escape(str)
{
	return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
function caseInsensitive(re)
{
	return new RegExp(re.source, 'gi');
}
function regex(raw)
{
	return new RegExp(raw, 'g');
}

function contains(re, string)
{
	return string.match(re) !== null;
}

function find(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var out = [];
	var number = 0;
	var string = str;
	var lastIndex = re.lastIndex;
	var prevLastIndex = -1;
	var result;
	while (number++ < n && (result = re.exec(string)))
	{
		if (prevLastIndex === re.lastIndex) break;
		var i = result.length - 1;
		var subs = new Array(i);
		while (i > 0)
		{
			var submatch = result[i];
			subs[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		out.push({
			match: result[0],
			submatches: _elm_lang$core$Native_List.fromArray(subs),
			index: result.index,
			number: number
		});
		prevLastIndex = re.lastIndex;
	}
	re.lastIndex = lastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

function replace(n, re, replacer, string)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var count = 0;
	function jsReplacer(match)
	{
		if (count++ >= n)
		{
			return match;
		}
		var i = arguments.length - 3;
		var submatches = new Array(i);
		while (i > 0)
		{
			var submatch = arguments[i];
			submatches[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		return replacer({
			match: match,
			submatches: _elm_lang$core$Native_List.fromArray(submatches),
			index: arguments[arguments.length - 2],
			number: count
		});
	}
	return string.replace(re, jsReplacer);
}

function split(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	if (n === Infinity)
	{
		return _elm_lang$core$Native_List.fromArray(str.split(re));
	}
	var string = str;
	var result;
	var out = [];
	var start = re.lastIndex;
	var restoreLastIndex = re.lastIndex;
	while (n--)
	{
		if (!(result = re.exec(string))) break;
		out.push(string.slice(start, result.index));
		start = re.lastIndex;
	}
	out.push(string.slice(start));
	re.lastIndex = restoreLastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

return {
	regex: regex,
	caseInsensitive: caseInsensitive,
	escape: escape,

	contains: F2(contains),
	find: F3(find),
	replace: F4(replace),
	split: F3(split)
};

}();

var _elm_lang$core$Random$onSelfMsg = F3(
	function (_p1, _p0, seed) {
		return _elm_lang$core$Task$succeed(seed);
	});
var _elm_lang$core$Random$magicNum8 = 2147483562;
var _elm_lang$core$Random$range = function (_p2) {
	return {ctor: '_Tuple2', _0: 0, _1: _elm_lang$core$Random$magicNum8};
};
var _elm_lang$core$Random$magicNum7 = 2147483399;
var _elm_lang$core$Random$magicNum6 = 2147483563;
var _elm_lang$core$Random$magicNum5 = 3791;
var _elm_lang$core$Random$magicNum4 = 40692;
var _elm_lang$core$Random$magicNum3 = 52774;
var _elm_lang$core$Random$magicNum2 = 12211;
var _elm_lang$core$Random$magicNum1 = 53668;
var _elm_lang$core$Random$magicNum0 = 40014;
var _elm_lang$core$Random$step = F2(
	function (_p3, seed) {
		var _p4 = _p3;
		return _p4._0(seed);
	});
var _elm_lang$core$Random$onEffects = F3(
	function (router, commands, seed) {
		var _p5 = commands;
		if (_p5.ctor === '[]') {
			return _elm_lang$core$Task$succeed(seed);
		} else {
			var _p6 = A2(_elm_lang$core$Random$step, _p5._0._0, seed);
			var value = _p6._0;
			var newSeed = _p6._1;
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p7) {
					return A3(_elm_lang$core$Random$onEffects, router, _p5._1, newSeed);
				},
				A2(_elm_lang$core$Platform$sendToApp, router, value));
		}
	});
var _elm_lang$core$Random$listHelp = F4(
	function (list, n, generate, seed) {
		listHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 1) < 0) {
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$List$reverse(list),
					_1: seed
				};
			} else {
				var _p8 = generate(seed);
				var value = _p8._0;
				var newSeed = _p8._1;
				var _v2 = {ctor: '::', _0: value, _1: list},
					_v3 = n - 1,
					_v4 = generate,
					_v5 = newSeed;
				list = _v2;
				n = _v3;
				generate = _v4;
				seed = _v5;
				continue listHelp;
			}
		}
	});
var _elm_lang$core$Random$minInt = -2147483648;
var _elm_lang$core$Random$maxInt = 2147483647;
var _elm_lang$core$Random$iLogBase = F2(
	function (b, i) {
		return (_elm_lang$core$Native_Utils.cmp(i, b) < 0) ? 1 : (1 + A2(_elm_lang$core$Random$iLogBase, b, (i / b) | 0));
	});
var _elm_lang$core$Random$command = _elm_lang$core$Native_Platform.leaf('Random');
var _elm_lang$core$Random$Generator = function (a) {
	return {ctor: 'Generator', _0: a};
};
var _elm_lang$core$Random$list = F2(
	function (n, _p9) {
		var _p10 = _p9;
		return _elm_lang$core$Random$Generator(
			function (seed) {
				return A4(
					_elm_lang$core$Random$listHelp,
					{ctor: '[]'},
					n,
					_p10._0,
					seed);
			});
	});
var _elm_lang$core$Random$map = F2(
	function (func, _p11) {
		var _p12 = _p11;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p13 = _p12._0(seed0);
				var a = _p13._0;
				var seed1 = _p13._1;
				return {
					ctor: '_Tuple2',
					_0: func(a),
					_1: seed1
				};
			});
	});
var _elm_lang$core$Random$map2 = F3(
	function (func, _p15, _p14) {
		var _p16 = _p15;
		var _p17 = _p14;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p18 = _p16._0(seed0);
				var a = _p18._0;
				var seed1 = _p18._1;
				var _p19 = _p17._0(seed1);
				var b = _p19._0;
				var seed2 = _p19._1;
				return {
					ctor: '_Tuple2',
					_0: A2(func, a, b),
					_1: seed2
				};
			});
	});
var _elm_lang$core$Random$pair = F2(
	function (genA, genB) {
		return A3(
			_elm_lang$core$Random$map2,
			F2(
				function (v0, v1) {
					return {ctor: '_Tuple2', _0: v0, _1: v1};
				}),
			genA,
			genB);
	});
var _elm_lang$core$Random$map3 = F4(
	function (func, _p22, _p21, _p20) {
		var _p23 = _p22;
		var _p24 = _p21;
		var _p25 = _p20;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p26 = _p23._0(seed0);
				var a = _p26._0;
				var seed1 = _p26._1;
				var _p27 = _p24._0(seed1);
				var b = _p27._0;
				var seed2 = _p27._1;
				var _p28 = _p25._0(seed2);
				var c = _p28._0;
				var seed3 = _p28._1;
				return {
					ctor: '_Tuple2',
					_0: A3(func, a, b, c),
					_1: seed3
				};
			});
	});
var _elm_lang$core$Random$map4 = F5(
	function (func, _p32, _p31, _p30, _p29) {
		var _p33 = _p32;
		var _p34 = _p31;
		var _p35 = _p30;
		var _p36 = _p29;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p37 = _p33._0(seed0);
				var a = _p37._0;
				var seed1 = _p37._1;
				var _p38 = _p34._0(seed1);
				var b = _p38._0;
				var seed2 = _p38._1;
				var _p39 = _p35._0(seed2);
				var c = _p39._0;
				var seed3 = _p39._1;
				var _p40 = _p36._0(seed3);
				var d = _p40._0;
				var seed4 = _p40._1;
				return {
					ctor: '_Tuple2',
					_0: A4(func, a, b, c, d),
					_1: seed4
				};
			});
	});
var _elm_lang$core$Random$map5 = F6(
	function (func, _p45, _p44, _p43, _p42, _p41) {
		var _p46 = _p45;
		var _p47 = _p44;
		var _p48 = _p43;
		var _p49 = _p42;
		var _p50 = _p41;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p51 = _p46._0(seed0);
				var a = _p51._0;
				var seed1 = _p51._1;
				var _p52 = _p47._0(seed1);
				var b = _p52._0;
				var seed2 = _p52._1;
				var _p53 = _p48._0(seed2);
				var c = _p53._0;
				var seed3 = _p53._1;
				var _p54 = _p49._0(seed3);
				var d = _p54._0;
				var seed4 = _p54._1;
				var _p55 = _p50._0(seed4);
				var e = _p55._0;
				var seed5 = _p55._1;
				return {
					ctor: '_Tuple2',
					_0: A5(func, a, b, c, d, e),
					_1: seed5
				};
			});
	});
var _elm_lang$core$Random$andThen = F2(
	function (callback, _p56) {
		var _p57 = _p56;
		return _elm_lang$core$Random$Generator(
			function (seed) {
				var _p58 = _p57._0(seed);
				var result = _p58._0;
				var newSeed = _p58._1;
				var _p59 = callback(result);
				var genB = _p59._0;
				return genB(newSeed);
			});
	});
var _elm_lang$core$Random$State = F2(
	function (a, b) {
		return {ctor: 'State', _0: a, _1: b};
	});
var _elm_lang$core$Random$initState = function (seed) {
	var s = A2(_elm_lang$core$Basics$max, seed, 0 - seed);
	var q = (s / (_elm_lang$core$Random$magicNum6 - 1)) | 0;
	var s2 = A2(_elm_lang$core$Basics_ops['%'], q, _elm_lang$core$Random$magicNum7 - 1);
	var s1 = A2(_elm_lang$core$Basics_ops['%'], s, _elm_lang$core$Random$magicNum6 - 1);
	return A2(_elm_lang$core$Random$State, s1 + 1, s2 + 1);
};
var _elm_lang$core$Random$next = function (_p60) {
	var _p61 = _p60;
	var _p63 = _p61._1;
	var _p62 = _p61._0;
	var k2 = (_p63 / _elm_lang$core$Random$magicNum3) | 0;
	var rawState2 = (_elm_lang$core$Random$magicNum4 * (_p63 - (k2 * _elm_lang$core$Random$magicNum3))) - (k2 * _elm_lang$core$Random$magicNum5);
	var newState2 = (_elm_lang$core$Native_Utils.cmp(rawState2, 0) < 0) ? (rawState2 + _elm_lang$core$Random$magicNum7) : rawState2;
	var k1 = (_p62 / _elm_lang$core$Random$magicNum1) | 0;
	var rawState1 = (_elm_lang$core$Random$magicNum0 * (_p62 - (k1 * _elm_lang$core$Random$magicNum1))) - (k1 * _elm_lang$core$Random$magicNum2);
	var newState1 = (_elm_lang$core$Native_Utils.cmp(rawState1, 0) < 0) ? (rawState1 + _elm_lang$core$Random$magicNum6) : rawState1;
	var z = newState1 - newState2;
	var newZ = (_elm_lang$core$Native_Utils.cmp(z, 1) < 0) ? (z + _elm_lang$core$Random$magicNum8) : z;
	return {
		ctor: '_Tuple2',
		_0: newZ,
		_1: A2(_elm_lang$core$Random$State, newState1, newState2)
	};
};
var _elm_lang$core$Random$split = function (_p64) {
	var _p65 = _p64;
	var _p68 = _p65._1;
	var _p67 = _p65._0;
	var _p66 = _elm_lang$core$Tuple$second(
		_elm_lang$core$Random$next(_p65));
	var t1 = _p66._0;
	var t2 = _p66._1;
	var new_s2 = _elm_lang$core$Native_Utils.eq(_p68, 1) ? (_elm_lang$core$Random$magicNum7 - 1) : (_p68 - 1);
	var new_s1 = _elm_lang$core$Native_Utils.eq(_p67, _elm_lang$core$Random$magicNum6 - 1) ? 1 : (_p67 + 1);
	return {
		ctor: '_Tuple2',
		_0: A2(_elm_lang$core$Random$State, new_s1, t2),
		_1: A2(_elm_lang$core$Random$State, t1, new_s2)
	};
};
var _elm_lang$core$Random$Seed = function (a) {
	return {ctor: 'Seed', _0: a};
};
var _elm_lang$core$Random$int = F2(
	function (a, b) {
		return _elm_lang$core$Random$Generator(
			function (_p69) {
				var _p70 = _p69;
				var _p75 = _p70._0;
				var base = 2147483561;
				var f = F3(
					function (n, acc, state) {
						f:
						while (true) {
							var _p71 = n;
							if (_p71 === 0) {
								return {ctor: '_Tuple2', _0: acc, _1: state};
							} else {
								var _p72 = _p75.next(state);
								var x = _p72._0;
								var nextState = _p72._1;
								var _v27 = n - 1,
									_v28 = x + (acc * base),
									_v29 = nextState;
								n = _v27;
								acc = _v28;
								state = _v29;
								continue f;
							}
						}
					});
				var _p73 = (_elm_lang$core$Native_Utils.cmp(a, b) < 0) ? {ctor: '_Tuple2', _0: a, _1: b} : {ctor: '_Tuple2', _0: b, _1: a};
				var lo = _p73._0;
				var hi = _p73._1;
				var k = (hi - lo) + 1;
				var n = A2(_elm_lang$core$Random$iLogBase, base, k);
				var _p74 = A3(f, n, 1, _p75.state);
				var v = _p74._0;
				var nextState = _p74._1;
				return {
					ctor: '_Tuple2',
					_0: lo + A2(_elm_lang$core$Basics_ops['%'], v, k),
					_1: _elm_lang$core$Random$Seed(
						_elm_lang$core$Native_Utils.update(
							_p75,
							{state: nextState}))
				};
			});
	});
var _elm_lang$core$Random$bool = A2(
	_elm_lang$core$Random$map,
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.eq(x, y);
		})(1),
	A2(_elm_lang$core$Random$int, 0, 1));
var _elm_lang$core$Random$float = F2(
	function (a, b) {
		return _elm_lang$core$Random$Generator(
			function (seed) {
				var _p76 = A2(
					_elm_lang$core$Random$step,
					A2(_elm_lang$core$Random$int, _elm_lang$core$Random$minInt, _elm_lang$core$Random$maxInt),
					seed);
				var number = _p76._0;
				var newSeed = _p76._1;
				var negativeOneToOne = _elm_lang$core$Basics$toFloat(number) / _elm_lang$core$Basics$toFloat(_elm_lang$core$Random$maxInt - _elm_lang$core$Random$minInt);
				var _p77 = (_elm_lang$core$Native_Utils.cmp(a, b) < 0) ? {ctor: '_Tuple2', _0: a, _1: b} : {ctor: '_Tuple2', _0: b, _1: a};
				var lo = _p77._0;
				var hi = _p77._1;
				var scaled = ((lo + hi) / 2) + ((hi - lo) * negativeOneToOne);
				return {ctor: '_Tuple2', _0: scaled, _1: newSeed};
			});
	});
var _elm_lang$core$Random$initialSeed = function (n) {
	return _elm_lang$core$Random$Seed(
		{
			state: _elm_lang$core$Random$initState(n),
			next: _elm_lang$core$Random$next,
			split: _elm_lang$core$Random$split,
			range: _elm_lang$core$Random$range
		});
};
var _elm_lang$core$Random$init = A2(
	_elm_lang$core$Task$andThen,
	function (t) {
		return _elm_lang$core$Task$succeed(
			_elm_lang$core$Random$initialSeed(
				_elm_lang$core$Basics$round(t)));
	},
	_elm_lang$core$Time$now);
var _elm_lang$core$Random$Generate = function (a) {
	return {ctor: 'Generate', _0: a};
};
var _elm_lang$core$Random$generate = F2(
	function (tagger, generator) {
		return _elm_lang$core$Random$command(
			_elm_lang$core$Random$Generate(
				A2(_elm_lang$core$Random$map, tagger, generator)));
	});
var _elm_lang$core$Random$cmdMap = F2(
	function (func, _p78) {
		var _p79 = _p78;
		return _elm_lang$core$Random$Generate(
			A2(_elm_lang$core$Random$map, func, _p79._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Random'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Random$init, onEffects: _elm_lang$core$Random$onEffects, onSelfMsg: _elm_lang$core$Random$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Random$cmdMap};

var _elm_lang$core$Regex$split = _elm_lang$core$Native_Regex.split;
var _elm_lang$core$Regex$replace = _elm_lang$core$Native_Regex.replace;
var _elm_lang$core$Regex$find = _elm_lang$core$Native_Regex.find;
var _elm_lang$core$Regex$contains = _elm_lang$core$Native_Regex.contains;
var _elm_lang$core$Regex$caseInsensitive = _elm_lang$core$Native_Regex.caseInsensitive;
var _elm_lang$core$Regex$regex = _elm_lang$core$Native_Regex.regex;
var _elm_lang$core$Regex$escape = _elm_lang$core$Native_Regex.escape;
var _elm_lang$core$Regex$Match = F4(
	function (a, b, c, d) {
		return {match: a, submatches: b, index: c, number: d};
	});
var _elm_lang$core$Regex$Regex = {ctor: 'Regex'};
var _elm_lang$core$Regex$AtMost = function (a) {
	return {ctor: 'AtMost', _0: a};
};
var _elm_lang$core$Regex$All = {ctor: 'All'};

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (a.options !== b.options)
	{
		if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _elm_lang$html$Html_Lazy$lazy3 = _elm_lang$virtual_dom$VirtualDom$lazy3;
var _elm_lang$html$Html_Lazy$lazy2 = _elm_lang$virtual_dom$VirtualDom$lazy2;
var _elm_lang$html$Html_Lazy$lazy = _elm_lang$virtual_dom$VirtualDom$lazy;

var _elm_lang$svg$Svg$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$svg$Svg$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$svg$Svg$svgNamespace = A2(
	_elm_lang$virtual_dom$VirtualDom$property,
	'namespace',
	_elm_lang$core$Json_Encode$string('http://www.w3.org/2000/svg'));
var _elm_lang$svg$Svg$node = F3(
	function (name, attributes, children) {
		return A3(
			_elm_lang$virtual_dom$VirtualDom$node,
			name,
			{ctor: '::', _0: _elm_lang$svg$Svg$svgNamespace, _1: attributes},
			children);
	});
var _elm_lang$svg$Svg$svg = _elm_lang$svg$Svg$node('svg');
var _elm_lang$svg$Svg$foreignObject = _elm_lang$svg$Svg$node('foreignObject');
var _elm_lang$svg$Svg$animate = _elm_lang$svg$Svg$node('animate');
var _elm_lang$svg$Svg$animateColor = _elm_lang$svg$Svg$node('animateColor');
var _elm_lang$svg$Svg$animateMotion = _elm_lang$svg$Svg$node('animateMotion');
var _elm_lang$svg$Svg$animateTransform = _elm_lang$svg$Svg$node('animateTransform');
var _elm_lang$svg$Svg$mpath = _elm_lang$svg$Svg$node('mpath');
var _elm_lang$svg$Svg$set = _elm_lang$svg$Svg$node('set');
var _elm_lang$svg$Svg$a = _elm_lang$svg$Svg$node('a');
var _elm_lang$svg$Svg$defs = _elm_lang$svg$Svg$node('defs');
var _elm_lang$svg$Svg$g = _elm_lang$svg$Svg$node('g');
var _elm_lang$svg$Svg$marker = _elm_lang$svg$Svg$node('marker');
var _elm_lang$svg$Svg$mask = _elm_lang$svg$Svg$node('mask');
var _elm_lang$svg$Svg$pattern = _elm_lang$svg$Svg$node('pattern');
var _elm_lang$svg$Svg$switch = _elm_lang$svg$Svg$node('switch');
var _elm_lang$svg$Svg$symbol = _elm_lang$svg$Svg$node('symbol');
var _elm_lang$svg$Svg$desc = _elm_lang$svg$Svg$node('desc');
var _elm_lang$svg$Svg$metadata = _elm_lang$svg$Svg$node('metadata');
var _elm_lang$svg$Svg$title = _elm_lang$svg$Svg$node('title');
var _elm_lang$svg$Svg$feBlend = _elm_lang$svg$Svg$node('feBlend');
var _elm_lang$svg$Svg$feColorMatrix = _elm_lang$svg$Svg$node('feColorMatrix');
var _elm_lang$svg$Svg$feComponentTransfer = _elm_lang$svg$Svg$node('feComponentTransfer');
var _elm_lang$svg$Svg$feComposite = _elm_lang$svg$Svg$node('feComposite');
var _elm_lang$svg$Svg$feConvolveMatrix = _elm_lang$svg$Svg$node('feConvolveMatrix');
var _elm_lang$svg$Svg$feDiffuseLighting = _elm_lang$svg$Svg$node('feDiffuseLighting');
var _elm_lang$svg$Svg$feDisplacementMap = _elm_lang$svg$Svg$node('feDisplacementMap');
var _elm_lang$svg$Svg$feFlood = _elm_lang$svg$Svg$node('feFlood');
var _elm_lang$svg$Svg$feFuncA = _elm_lang$svg$Svg$node('feFuncA');
var _elm_lang$svg$Svg$feFuncB = _elm_lang$svg$Svg$node('feFuncB');
var _elm_lang$svg$Svg$feFuncG = _elm_lang$svg$Svg$node('feFuncG');
var _elm_lang$svg$Svg$feFuncR = _elm_lang$svg$Svg$node('feFuncR');
var _elm_lang$svg$Svg$feGaussianBlur = _elm_lang$svg$Svg$node('feGaussianBlur');
var _elm_lang$svg$Svg$feImage = _elm_lang$svg$Svg$node('feImage');
var _elm_lang$svg$Svg$feMerge = _elm_lang$svg$Svg$node('feMerge');
var _elm_lang$svg$Svg$feMergeNode = _elm_lang$svg$Svg$node('feMergeNode');
var _elm_lang$svg$Svg$feMorphology = _elm_lang$svg$Svg$node('feMorphology');
var _elm_lang$svg$Svg$feOffset = _elm_lang$svg$Svg$node('feOffset');
var _elm_lang$svg$Svg$feSpecularLighting = _elm_lang$svg$Svg$node('feSpecularLighting');
var _elm_lang$svg$Svg$feTile = _elm_lang$svg$Svg$node('feTile');
var _elm_lang$svg$Svg$feTurbulence = _elm_lang$svg$Svg$node('feTurbulence');
var _elm_lang$svg$Svg$font = _elm_lang$svg$Svg$node('font');
var _elm_lang$svg$Svg$linearGradient = _elm_lang$svg$Svg$node('linearGradient');
var _elm_lang$svg$Svg$radialGradient = _elm_lang$svg$Svg$node('radialGradient');
var _elm_lang$svg$Svg$stop = _elm_lang$svg$Svg$node('stop');
var _elm_lang$svg$Svg$circle = _elm_lang$svg$Svg$node('circle');
var _elm_lang$svg$Svg$ellipse = _elm_lang$svg$Svg$node('ellipse');
var _elm_lang$svg$Svg$image = _elm_lang$svg$Svg$node('image');
var _elm_lang$svg$Svg$line = _elm_lang$svg$Svg$node('line');
var _elm_lang$svg$Svg$path = _elm_lang$svg$Svg$node('path');
var _elm_lang$svg$Svg$polygon = _elm_lang$svg$Svg$node('polygon');
var _elm_lang$svg$Svg$polyline = _elm_lang$svg$Svg$node('polyline');
var _elm_lang$svg$Svg$rect = _elm_lang$svg$Svg$node('rect');
var _elm_lang$svg$Svg$use = _elm_lang$svg$Svg$node('use');
var _elm_lang$svg$Svg$feDistantLight = _elm_lang$svg$Svg$node('feDistantLight');
var _elm_lang$svg$Svg$fePointLight = _elm_lang$svg$Svg$node('fePointLight');
var _elm_lang$svg$Svg$feSpotLight = _elm_lang$svg$Svg$node('feSpotLight');
var _elm_lang$svg$Svg$altGlyph = _elm_lang$svg$Svg$node('altGlyph');
var _elm_lang$svg$Svg$altGlyphDef = _elm_lang$svg$Svg$node('altGlyphDef');
var _elm_lang$svg$Svg$altGlyphItem = _elm_lang$svg$Svg$node('altGlyphItem');
var _elm_lang$svg$Svg$glyph = _elm_lang$svg$Svg$node('glyph');
var _elm_lang$svg$Svg$glyphRef = _elm_lang$svg$Svg$node('glyphRef');
var _elm_lang$svg$Svg$textPath = _elm_lang$svg$Svg$node('textPath');
var _elm_lang$svg$Svg$text_ = _elm_lang$svg$Svg$node('text');
var _elm_lang$svg$Svg$tref = _elm_lang$svg$Svg$node('tref');
var _elm_lang$svg$Svg$tspan = _elm_lang$svg$Svg$node('tspan');
var _elm_lang$svg$Svg$clipPath = _elm_lang$svg$Svg$node('clipPath');
var _elm_lang$svg$Svg$colorProfile = _elm_lang$svg$Svg$node('colorProfile');
var _elm_lang$svg$Svg$cursor = _elm_lang$svg$Svg$node('cursor');
var _elm_lang$svg$Svg$filter = _elm_lang$svg$Svg$node('filter');
var _elm_lang$svg$Svg$script = _elm_lang$svg$Svg$node('script');
var _elm_lang$svg$Svg$style = _elm_lang$svg$Svg$node('style');
var _elm_lang$svg$Svg$view = _elm_lang$svg$Svg$node('view');

var _elm_lang$svg$Svg_Attributes$writingMode = _elm_lang$virtual_dom$VirtualDom$attribute('writing-mode');
var _elm_lang$svg$Svg_Attributes$wordSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('word-spacing');
var _elm_lang$svg$Svg_Attributes$visibility = _elm_lang$virtual_dom$VirtualDom$attribute('visibility');
var _elm_lang$svg$Svg_Attributes$unicodeBidi = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-bidi');
var _elm_lang$svg$Svg_Attributes$textRendering = _elm_lang$virtual_dom$VirtualDom$attribute('text-rendering');
var _elm_lang$svg$Svg_Attributes$textDecoration = _elm_lang$virtual_dom$VirtualDom$attribute('text-decoration');
var _elm_lang$svg$Svg_Attributes$textAnchor = _elm_lang$virtual_dom$VirtualDom$attribute('text-anchor');
var _elm_lang$svg$Svg_Attributes$stroke = _elm_lang$virtual_dom$VirtualDom$attribute('stroke');
var _elm_lang$svg$Svg_Attributes$strokeWidth = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-width');
var _elm_lang$svg$Svg_Attributes$strokeOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-opacity');
var _elm_lang$svg$Svg_Attributes$strokeMiterlimit = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-miterlimit');
var _elm_lang$svg$Svg_Attributes$strokeLinejoin = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linejoin');
var _elm_lang$svg$Svg_Attributes$strokeLinecap = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linecap');
var _elm_lang$svg$Svg_Attributes$strokeDashoffset = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dashoffset');
var _elm_lang$svg$Svg_Attributes$strokeDasharray = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dasharray');
var _elm_lang$svg$Svg_Attributes$stopOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stop-opacity');
var _elm_lang$svg$Svg_Attributes$stopColor = _elm_lang$virtual_dom$VirtualDom$attribute('stop-color');
var _elm_lang$svg$Svg_Attributes$shapeRendering = _elm_lang$virtual_dom$VirtualDom$attribute('shape-rendering');
var _elm_lang$svg$Svg_Attributes$pointerEvents = _elm_lang$virtual_dom$VirtualDom$attribute('pointer-events');
var _elm_lang$svg$Svg_Attributes$overflow = _elm_lang$virtual_dom$VirtualDom$attribute('overflow');
var _elm_lang$svg$Svg_Attributes$opacity = _elm_lang$virtual_dom$VirtualDom$attribute('opacity');
var _elm_lang$svg$Svg_Attributes$mask = _elm_lang$virtual_dom$VirtualDom$attribute('mask');
var _elm_lang$svg$Svg_Attributes$markerStart = _elm_lang$virtual_dom$VirtualDom$attribute('marker-start');
var _elm_lang$svg$Svg_Attributes$markerMid = _elm_lang$virtual_dom$VirtualDom$attribute('marker-mid');
var _elm_lang$svg$Svg_Attributes$markerEnd = _elm_lang$virtual_dom$VirtualDom$attribute('marker-end');
var _elm_lang$svg$Svg_Attributes$lightingColor = _elm_lang$virtual_dom$VirtualDom$attribute('lighting-color');
var _elm_lang$svg$Svg_Attributes$letterSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('letter-spacing');
var _elm_lang$svg$Svg_Attributes$kerning = _elm_lang$virtual_dom$VirtualDom$attribute('kerning');
var _elm_lang$svg$Svg_Attributes$imageRendering = _elm_lang$virtual_dom$VirtualDom$attribute('image-rendering');
var _elm_lang$svg$Svg_Attributes$glyphOrientationVertical = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-vertical');
var _elm_lang$svg$Svg_Attributes$glyphOrientationHorizontal = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-horizontal');
var _elm_lang$svg$Svg_Attributes$fontWeight = _elm_lang$virtual_dom$VirtualDom$attribute('font-weight');
var _elm_lang$svg$Svg_Attributes$fontVariant = _elm_lang$virtual_dom$VirtualDom$attribute('font-variant');
var _elm_lang$svg$Svg_Attributes$fontStyle = _elm_lang$virtual_dom$VirtualDom$attribute('font-style');
var _elm_lang$svg$Svg_Attributes$fontStretch = _elm_lang$virtual_dom$VirtualDom$attribute('font-stretch');
var _elm_lang$svg$Svg_Attributes$fontSize = _elm_lang$virtual_dom$VirtualDom$attribute('font-size');
var _elm_lang$svg$Svg_Attributes$fontSizeAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('font-size-adjust');
var _elm_lang$svg$Svg_Attributes$fontFamily = _elm_lang$virtual_dom$VirtualDom$attribute('font-family');
var _elm_lang$svg$Svg_Attributes$floodOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('flood-opacity');
var _elm_lang$svg$Svg_Attributes$floodColor = _elm_lang$virtual_dom$VirtualDom$attribute('flood-color');
var _elm_lang$svg$Svg_Attributes$filter = _elm_lang$virtual_dom$VirtualDom$attribute('filter');
var _elm_lang$svg$Svg_Attributes$fill = _elm_lang$virtual_dom$VirtualDom$attribute('fill');
var _elm_lang$svg$Svg_Attributes$fillRule = _elm_lang$virtual_dom$VirtualDom$attribute('fill-rule');
var _elm_lang$svg$Svg_Attributes$fillOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('fill-opacity');
var _elm_lang$svg$Svg_Attributes$enableBackground = _elm_lang$virtual_dom$VirtualDom$attribute('enable-background');
var _elm_lang$svg$Svg_Attributes$dominantBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('dominant-baseline');
var _elm_lang$svg$Svg_Attributes$display = _elm_lang$virtual_dom$VirtualDom$attribute('display');
var _elm_lang$svg$Svg_Attributes$direction = _elm_lang$virtual_dom$VirtualDom$attribute('direction');
var _elm_lang$svg$Svg_Attributes$cursor = _elm_lang$virtual_dom$VirtualDom$attribute('cursor');
var _elm_lang$svg$Svg_Attributes$color = _elm_lang$virtual_dom$VirtualDom$attribute('color');
var _elm_lang$svg$Svg_Attributes$colorRendering = _elm_lang$virtual_dom$VirtualDom$attribute('color-rendering');
var _elm_lang$svg$Svg_Attributes$colorProfile = _elm_lang$virtual_dom$VirtualDom$attribute('color-profile');
var _elm_lang$svg$Svg_Attributes$colorInterpolation = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation');
var _elm_lang$svg$Svg_Attributes$colorInterpolationFilters = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation-filters');
var _elm_lang$svg$Svg_Attributes$clip = _elm_lang$virtual_dom$VirtualDom$attribute('clip');
var _elm_lang$svg$Svg_Attributes$clipRule = _elm_lang$virtual_dom$VirtualDom$attribute('clip-rule');
var _elm_lang$svg$Svg_Attributes$clipPath = _elm_lang$virtual_dom$VirtualDom$attribute('clip-path');
var _elm_lang$svg$Svg_Attributes$baselineShift = _elm_lang$virtual_dom$VirtualDom$attribute('baseline-shift');
var _elm_lang$svg$Svg_Attributes$alignmentBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('alignment-baseline');
var _elm_lang$svg$Svg_Attributes$zoomAndPan = _elm_lang$virtual_dom$VirtualDom$attribute('zoomAndPan');
var _elm_lang$svg$Svg_Attributes$z = _elm_lang$virtual_dom$VirtualDom$attribute('z');
var _elm_lang$svg$Svg_Attributes$yChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('yChannelSelector');
var _elm_lang$svg$Svg_Attributes$y2 = _elm_lang$virtual_dom$VirtualDom$attribute('y2');
var _elm_lang$svg$Svg_Attributes$y1 = _elm_lang$virtual_dom$VirtualDom$attribute('y1');
var _elm_lang$svg$Svg_Attributes$y = _elm_lang$virtual_dom$VirtualDom$attribute('y');
var _elm_lang$svg$Svg_Attributes$xmlSpace = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:space');
var _elm_lang$svg$Svg_Attributes$xmlLang = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:lang');
var _elm_lang$svg$Svg_Attributes$xmlBase = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:base');
var _elm_lang$svg$Svg_Attributes$xlinkType = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:type');
var _elm_lang$svg$Svg_Attributes$xlinkTitle = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:title');
var _elm_lang$svg$Svg_Attributes$xlinkShow = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:show');
var _elm_lang$svg$Svg_Attributes$xlinkRole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:role');
var _elm_lang$svg$Svg_Attributes$xlinkHref = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:href');
var _elm_lang$svg$Svg_Attributes$xlinkArcrole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:arcrole');
var _elm_lang$svg$Svg_Attributes$xlinkActuate = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:actuate');
var _elm_lang$svg$Svg_Attributes$xChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('xChannelSelector');
var _elm_lang$svg$Svg_Attributes$x2 = _elm_lang$virtual_dom$VirtualDom$attribute('x2');
var _elm_lang$svg$Svg_Attributes$x1 = _elm_lang$virtual_dom$VirtualDom$attribute('x1');
var _elm_lang$svg$Svg_Attributes$xHeight = _elm_lang$virtual_dom$VirtualDom$attribute('x-height');
var _elm_lang$svg$Svg_Attributes$x = _elm_lang$virtual_dom$VirtualDom$attribute('x');
var _elm_lang$svg$Svg_Attributes$widths = _elm_lang$virtual_dom$VirtualDom$attribute('widths');
var _elm_lang$svg$Svg_Attributes$width = _elm_lang$virtual_dom$VirtualDom$attribute('width');
var _elm_lang$svg$Svg_Attributes$viewTarget = _elm_lang$virtual_dom$VirtualDom$attribute('viewTarget');
var _elm_lang$svg$Svg_Attributes$viewBox = _elm_lang$virtual_dom$VirtualDom$attribute('viewBox');
var _elm_lang$svg$Svg_Attributes$vertOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-y');
var _elm_lang$svg$Svg_Attributes$vertOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-x');
var _elm_lang$svg$Svg_Attributes$vertAdvY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-adv-y');
var _elm_lang$svg$Svg_Attributes$version = _elm_lang$virtual_dom$VirtualDom$attribute('version');
var _elm_lang$svg$Svg_Attributes$values = _elm_lang$virtual_dom$VirtualDom$attribute('values');
var _elm_lang$svg$Svg_Attributes$vMathematical = _elm_lang$virtual_dom$VirtualDom$attribute('v-mathematical');
var _elm_lang$svg$Svg_Attributes$vIdeographic = _elm_lang$virtual_dom$VirtualDom$attribute('v-ideographic');
var _elm_lang$svg$Svg_Attributes$vHanging = _elm_lang$virtual_dom$VirtualDom$attribute('v-hanging');
var _elm_lang$svg$Svg_Attributes$vAlphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('v-alphabetic');
var _elm_lang$svg$Svg_Attributes$unitsPerEm = _elm_lang$virtual_dom$VirtualDom$attribute('units-per-em');
var _elm_lang$svg$Svg_Attributes$unicodeRange = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-range');
var _elm_lang$svg$Svg_Attributes$unicode = _elm_lang$virtual_dom$VirtualDom$attribute('unicode');
var _elm_lang$svg$Svg_Attributes$underlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('underline-thickness');
var _elm_lang$svg$Svg_Attributes$underlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('underline-position');
var _elm_lang$svg$Svg_Attributes$u2 = _elm_lang$virtual_dom$VirtualDom$attribute('u2');
var _elm_lang$svg$Svg_Attributes$u1 = _elm_lang$virtual_dom$VirtualDom$attribute('u1');
var _elm_lang$svg$Svg_Attributes$type_ = _elm_lang$virtual_dom$VirtualDom$attribute('type');
var _elm_lang$svg$Svg_Attributes$transform = _elm_lang$virtual_dom$VirtualDom$attribute('transform');
var _elm_lang$svg$Svg_Attributes$to = _elm_lang$virtual_dom$VirtualDom$attribute('to');
var _elm_lang$svg$Svg_Attributes$title = _elm_lang$virtual_dom$VirtualDom$attribute('title');
var _elm_lang$svg$Svg_Attributes$textLength = _elm_lang$virtual_dom$VirtualDom$attribute('textLength');
var _elm_lang$svg$Svg_Attributes$targetY = _elm_lang$virtual_dom$VirtualDom$attribute('targetY');
var _elm_lang$svg$Svg_Attributes$targetX = _elm_lang$virtual_dom$VirtualDom$attribute('targetX');
var _elm_lang$svg$Svg_Attributes$target = _elm_lang$virtual_dom$VirtualDom$attribute('target');
var _elm_lang$svg$Svg_Attributes$tableValues = _elm_lang$virtual_dom$VirtualDom$attribute('tableValues');
var _elm_lang$svg$Svg_Attributes$systemLanguage = _elm_lang$virtual_dom$VirtualDom$attribute('systemLanguage');
var _elm_lang$svg$Svg_Attributes$surfaceScale = _elm_lang$virtual_dom$VirtualDom$attribute('surfaceScale');
var _elm_lang$svg$Svg_Attributes$style = _elm_lang$virtual_dom$VirtualDom$attribute('style');
var _elm_lang$svg$Svg_Attributes$string = _elm_lang$virtual_dom$VirtualDom$attribute('string');
var _elm_lang$svg$Svg_Attributes$strikethroughThickness = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-thickness');
var _elm_lang$svg$Svg_Attributes$strikethroughPosition = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-position');
var _elm_lang$svg$Svg_Attributes$stitchTiles = _elm_lang$virtual_dom$VirtualDom$attribute('stitchTiles');
var _elm_lang$svg$Svg_Attributes$stemv = _elm_lang$virtual_dom$VirtualDom$attribute('stemv');
var _elm_lang$svg$Svg_Attributes$stemh = _elm_lang$virtual_dom$VirtualDom$attribute('stemh');
var _elm_lang$svg$Svg_Attributes$stdDeviation = _elm_lang$virtual_dom$VirtualDom$attribute('stdDeviation');
var _elm_lang$svg$Svg_Attributes$startOffset = _elm_lang$virtual_dom$VirtualDom$attribute('startOffset');
var _elm_lang$svg$Svg_Attributes$spreadMethod = _elm_lang$virtual_dom$VirtualDom$attribute('spreadMethod');
var _elm_lang$svg$Svg_Attributes$speed = _elm_lang$virtual_dom$VirtualDom$attribute('speed');
var _elm_lang$svg$Svg_Attributes$specularExponent = _elm_lang$virtual_dom$VirtualDom$attribute('specularExponent');
var _elm_lang$svg$Svg_Attributes$specularConstant = _elm_lang$virtual_dom$VirtualDom$attribute('specularConstant');
var _elm_lang$svg$Svg_Attributes$spacing = _elm_lang$virtual_dom$VirtualDom$attribute('spacing');
var _elm_lang$svg$Svg_Attributes$slope = _elm_lang$virtual_dom$VirtualDom$attribute('slope');
var _elm_lang$svg$Svg_Attributes$seed = _elm_lang$virtual_dom$VirtualDom$attribute('seed');
var _elm_lang$svg$Svg_Attributes$scale = _elm_lang$virtual_dom$VirtualDom$attribute('scale');
var _elm_lang$svg$Svg_Attributes$ry = _elm_lang$virtual_dom$VirtualDom$attribute('ry');
var _elm_lang$svg$Svg_Attributes$rx = _elm_lang$virtual_dom$VirtualDom$attribute('rx');
var _elm_lang$svg$Svg_Attributes$rotate = _elm_lang$virtual_dom$VirtualDom$attribute('rotate');
var _elm_lang$svg$Svg_Attributes$result = _elm_lang$virtual_dom$VirtualDom$attribute('result');
var _elm_lang$svg$Svg_Attributes$restart = _elm_lang$virtual_dom$VirtualDom$attribute('restart');
var _elm_lang$svg$Svg_Attributes$requiredFeatures = _elm_lang$virtual_dom$VirtualDom$attribute('requiredFeatures');
var _elm_lang$svg$Svg_Attributes$requiredExtensions = _elm_lang$virtual_dom$VirtualDom$attribute('requiredExtensions');
var _elm_lang$svg$Svg_Attributes$repeatDur = _elm_lang$virtual_dom$VirtualDom$attribute('repeatDur');
var _elm_lang$svg$Svg_Attributes$repeatCount = _elm_lang$virtual_dom$VirtualDom$attribute('repeatCount');
var _elm_lang$svg$Svg_Attributes$renderingIntent = _elm_lang$virtual_dom$VirtualDom$attribute('rendering-intent');
var _elm_lang$svg$Svg_Attributes$refY = _elm_lang$virtual_dom$VirtualDom$attribute('refY');
var _elm_lang$svg$Svg_Attributes$refX = _elm_lang$virtual_dom$VirtualDom$attribute('refX');
var _elm_lang$svg$Svg_Attributes$radius = _elm_lang$virtual_dom$VirtualDom$attribute('radius');
var _elm_lang$svg$Svg_Attributes$r = _elm_lang$virtual_dom$VirtualDom$attribute('r');
var _elm_lang$svg$Svg_Attributes$primitiveUnits = _elm_lang$virtual_dom$VirtualDom$attribute('primitiveUnits');
var _elm_lang$svg$Svg_Attributes$preserveAspectRatio = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAspectRatio');
var _elm_lang$svg$Svg_Attributes$preserveAlpha = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAlpha');
var _elm_lang$svg$Svg_Attributes$pointsAtZ = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtZ');
var _elm_lang$svg$Svg_Attributes$pointsAtY = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtY');
var _elm_lang$svg$Svg_Attributes$pointsAtX = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtX');
var _elm_lang$svg$Svg_Attributes$points = _elm_lang$virtual_dom$VirtualDom$attribute('points');
var _elm_lang$svg$Svg_Attributes$pointOrder = _elm_lang$virtual_dom$VirtualDom$attribute('point-order');
var _elm_lang$svg$Svg_Attributes$patternUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternUnits');
var _elm_lang$svg$Svg_Attributes$patternTransform = _elm_lang$virtual_dom$VirtualDom$attribute('patternTransform');
var _elm_lang$svg$Svg_Attributes$patternContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternContentUnits');
var _elm_lang$svg$Svg_Attributes$pathLength = _elm_lang$virtual_dom$VirtualDom$attribute('pathLength');
var _elm_lang$svg$Svg_Attributes$path = _elm_lang$virtual_dom$VirtualDom$attribute('path');
var _elm_lang$svg$Svg_Attributes$panose1 = _elm_lang$virtual_dom$VirtualDom$attribute('panose-1');
var _elm_lang$svg$Svg_Attributes$overlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('overline-thickness');
var _elm_lang$svg$Svg_Attributes$overlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('overline-position');
var _elm_lang$svg$Svg_Attributes$origin = _elm_lang$virtual_dom$VirtualDom$attribute('origin');
var _elm_lang$svg$Svg_Attributes$orientation = _elm_lang$virtual_dom$VirtualDom$attribute('orientation');
var _elm_lang$svg$Svg_Attributes$orient = _elm_lang$virtual_dom$VirtualDom$attribute('orient');
var _elm_lang$svg$Svg_Attributes$order = _elm_lang$virtual_dom$VirtualDom$attribute('order');
var _elm_lang$svg$Svg_Attributes$operator = _elm_lang$virtual_dom$VirtualDom$attribute('operator');
var _elm_lang$svg$Svg_Attributes$offset = _elm_lang$virtual_dom$VirtualDom$attribute('offset');
var _elm_lang$svg$Svg_Attributes$numOctaves = _elm_lang$virtual_dom$VirtualDom$attribute('numOctaves');
var _elm_lang$svg$Svg_Attributes$name = _elm_lang$virtual_dom$VirtualDom$attribute('name');
var _elm_lang$svg$Svg_Attributes$mode = _elm_lang$virtual_dom$VirtualDom$attribute('mode');
var _elm_lang$svg$Svg_Attributes$min = _elm_lang$virtual_dom$VirtualDom$attribute('min');
var _elm_lang$svg$Svg_Attributes$method = _elm_lang$virtual_dom$VirtualDom$attribute('method');
var _elm_lang$svg$Svg_Attributes$media = _elm_lang$virtual_dom$VirtualDom$attribute('media');
var _elm_lang$svg$Svg_Attributes$max = _elm_lang$virtual_dom$VirtualDom$attribute('max');
var _elm_lang$svg$Svg_Attributes$mathematical = _elm_lang$virtual_dom$VirtualDom$attribute('mathematical');
var _elm_lang$svg$Svg_Attributes$maskUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskUnits');
var _elm_lang$svg$Svg_Attributes$maskContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskContentUnits');
var _elm_lang$svg$Svg_Attributes$markerWidth = _elm_lang$virtual_dom$VirtualDom$attribute('markerWidth');
var _elm_lang$svg$Svg_Attributes$markerUnits = _elm_lang$virtual_dom$VirtualDom$attribute('markerUnits');
var _elm_lang$svg$Svg_Attributes$markerHeight = _elm_lang$virtual_dom$VirtualDom$attribute('markerHeight');
var _elm_lang$svg$Svg_Attributes$local = _elm_lang$virtual_dom$VirtualDom$attribute('local');
var _elm_lang$svg$Svg_Attributes$limitingConeAngle = _elm_lang$virtual_dom$VirtualDom$attribute('limitingConeAngle');
var _elm_lang$svg$Svg_Attributes$lengthAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('lengthAdjust');
var _elm_lang$svg$Svg_Attributes$lang = _elm_lang$virtual_dom$VirtualDom$attribute('lang');
var _elm_lang$svg$Svg_Attributes$keyTimes = _elm_lang$virtual_dom$VirtualDom$attribute('keyTimes');
var _elm_lang$svg$Svg_Attributes$keySplines = _elm_lang$virtual_dom$VirtualDom$attribute('keySplines');
var _elm_lang$svg$Svg_Attributes$keyPoints = _elm_lang$virtual_dom$VirtualDom$attribute('keyPoints');
var _elm_lang$svg$Svg_Attributes$kernelUnitLength = _elm_lang$virtual_dom$VirtualDom$attribute('kernelUnitLength');
var _elm_lang$svg$Svg_Attributes$kernelMatrix = _elm_lang$virtual_dom$VirtualDom$attribute('kernelMatrix');
var _elm_lang$svg$Svg_Attributes$k4 = _elm_lang$virtual_dom$VirtualDom$attribute('k4');
var _elm_lang$svg$Svg_Attributes$k3 = _elm_lang$virtual_dom$VirtualDom$attribute('k3');
var _elm_lang$svg$Svg_Attributes$k2 = _elm_lang$virtual_dom$VirtualDom$attribute('k2');
var _elm_lang$svg$Svg_Attributes$k1 = _elm_lang$virtual_dom$VirtualDom$attribute('k1');
var _elm_lang$svg$Svg_Attributes$k = _elm_lang$virtual_dom$VirtualDom$attribute('k');
var _elm_lang$svg$Svg_Attributes$intercept = _elm_lang$virtual_dom$VirtualDom$attribute('intercept');
var _elm_lang$svg$Svg_Attributes$in2 = _elm_lang$virtual_dom$VirtualDom$attribute('in2');
var _elm_lang$svg$Svg_Attributes$in_ = _elm_lang$virtual_dom$VirtualDom$attribute('in');
var _elm_lang$svg$Svg_Attributes$ideographic = _elm_lang$virtual_dom$VirtualDom$attribute('ideographic');
var _elm_lang$svg$Svg_Attributes$id = _elm_lang$virtual_dom$VirtualDom$attribute('id');
var _elm_lang$svg$Svg_Attributes$horizOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-y');
var _elm_lang$svg$Svg_Attributes$horizOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-x');
var _elm_lang$svg$Svg_Attributes$horizAdvX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-adv-x');
var _elm_lang$svg$Svg_Attributes$height = _elm_lang$virtual_dom$VirtualDom$attribute('height');
var _elm_lang$svg$Svg_Attributes$hanging = _elm_lang$virtual_dom$VirtualDom$attribute('hanging');
var _elm_lang$svg$Svg_Attributes$gradientUnits = _elm_lang$virtual_dom$VirtualDom$attribute('gradientUnits');
var _elm_lang$svg$Svg_Attributes$gradientTransform = _elm_lang$virtual_dom$VirtualDom$attribute('gradientTransform');
var _elm_lang$svg$Svg_Attributes$glyphRef = _elm_lang$virtual_dom$VirtualDom$attribute('glyphRef');
var _elm_lang$svg$Svg_Attributes$glyphName = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-name');
var _elm_lang$svg$Svg_Attributes$g2 = _elm_lang$virtual_dom$VirtualDom$attribute('g2');
var _elm_lang$svg$Svg_Attributes$g1 = _elm_lang$virtual_dom$VirtualDom$attribute('g1');
var _elm_lang$svg$Svg_Attributes$fy = _elm_lang$virtual_dom$VirtualDom$attribute('fy');
var _elm_lang$svg$Svg_Attributes$fx = _elm_lang$virtual_dom$VirtualDom$attribute('fx');
var _elm_lang$svg$Svg_Attributes$from = _elm_lang$virtual_dom$VirtualDom$attribute('from');
var _elm_lang$svg$Svg_Attributes$format = _elm_lang$virtual_dom$VirtualDom$attribute('format');
var _elm_lang$svg$Svg_Attributes$filterUnits = _elm_lang$virtual_dom$VirtualDom$attribute('filterUnits');
var _elm_lang$svg$Svg_Attributes$filterRes = _elm_lang$virtual_dom$VirtualDom$attribute('filterRes');
var _elm_lang$svg$Svg_Attributes$externalResourcesRequired = _elm_lang$virtual_dom$VirtualDom$attribute('externalResourcesRequired');
var _elm_lang$svg$Svg_Attributes$exponent = _elm_lang$virtual_dom$VirtualDom$attribute('exponent');
var _elm_lang$svg$Svg_Attributes$end = _elm_lang$virtual_dom$VirtualDom$attribute('end');
var _elm_lang$svg$Svg_Attributes$elevation = _elm_lang$virtual_dom$VirtualDom$attribute('elevation');
var _elm_lang$svg$Svg_Attributes$edgeMode = _elm_lang$virtual_dom$VirtualDom$attribute('edgeMode');
var _elm_lang$svg$Svg_Attributes$dy = _elm_lang$virtual_dom$VirtualDom$attribute('dy');
var _elm_lang$svg$Svg_Attributes$dx = _elm_lang$virtual_dom$VirtualDom$attribute('dx');
var _elm_lang$svg$Svg_Attributes$dur = _elm_lang$virtual_dom$VirtualDom$attribute('dur');
var _elm_lang$svg$Svg_Attributes$divisor = _elm_lang$virtual_dom$VirtualDom$attribute('divisor');
var _elm_lang$svg$Svg_Attributes$diffuseConstant = _elm_lang$virtual_dom$VirtualDom$attribute('diffuseConstant');
var _elm_lang$svg$Svg_Attributes$descent = _elm_lang$virtual_dom$VirtualDom$attribute('descent');
var _elm_lang$svg$Svg_Attributes$decelerate = _elm_lang$virtual_dom$VirtualDom$attribute('decelerate');
var _elm_lang$svg$Svg_Attributes$d = _elm_lang$virtual_dom$VirtualDom$attribute('d');
var _elm_lang$svg$Svg_Attributes$cy = _elm_lang$virtual_dom$VirtualDom$attribute('cy');
var _elm_lang$svg$Svg_Attributes$cx = _elm_lang$virtual_dom$VirtualDom$attribute('cx');
var _elm_lang$svg$Svg_Attributes$contentStyleType = _elm_lang$virtual_dom$VirtualDom$attribute('contentStyleType');
var _elm_lang$svg$Svg_Attributes$contentScriptType = _elm_lang$virtual_dom$VirtualDom$attribute('contentScriptType');
var _elm_lang$svg$Svg_Attributes$clipPathUnits = _elm_lang$virtual_dom$VirtualDom$attribute('clipPathUnits');
var _elm_lang$svg$Svg_Attributes$class = _elm_lang$virtual_dom$VirtualDom$attribute('class');
var _elm_lang$svg$Svg_Attributes$capHeight = _elm_lang$virtual_dom$VirtualDom$attribute('cap-height');
var _elm_lang$svg$Svg_Attributes$calcMode = _elm_lang$virtual_dom$VirtualDom$attribute('calcMode');
var _elm_lang$svg$Svg_Attributes$by = _elm_lang$virtual_dom$VirtualDom$attribute('by');
var _elm_lang$svg$Svg_Attributes$bias = _elm_lang$virtual_dom$VirtualDom$attribute('bias');
var _elm_lang$svg$Svg_Attributes$begin = _elm_lang$virtual_dom$VirtualDom$attribute('begin');
var _elm_lang$svg$Svg_Attributes$bbox = _elm_lang$virtual_dom$VirtualDom$attribute('bbox');
var _elm_lang$svg$Svg_Attributes$baseProfile = _elm_lang$virtual_dom$VirtualDom$attribute('baseProfile');
var _elm_lang$svg$Svg_Attributes$baseFrequency = _elm_lang$virtual_dom$VirtualDom$attribute('baseFrequency');
var _elm_lang$svg$Svg_Attributes$azimuth = _elm_lang$virtual_dom$VirtualDom$attribute('azimuth');
var _elm_lang$svg$Svg_Attributes$autoReverse = _elm_lang$virtual_dom$VirtualDom$attribute('autoReverse');
var _elm_lang$svg$Svg_Attributes$attributeType = _elm_lang$virtual_dom$VirtualDom$attribute('attributeType');
var _elm_lang$svg$Svg_Attributes$attributeName = _elm_lang$virtual_dom$VirtualDom$attribute('attributeName');
var _elm_lang$svg$Svg_Attributes$ascent = _elm_lang$virtual_dom$VirtualDom$attribute('ascent');
var _elm_lang$svg$Svg_Attributes$arabicForm = _elm_lang$virtual_dom$VirtualDom$attribute('arabic-form');
var _elm_lang$svg$Svg_Attributes$amplitude = _elm_lang$virtual_dom$VirtualDom$attribute('amplitude');
var _elm_lang$svg$Svg_Attributes$allowReorder = _elm_lang$virtual_dom$VirtualDom$attribute('allowReorder');
var _elm_lang$svg$Svg_Attributes$alphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('alphabetic');
var _elm_lang$svg$Svg_Attributes$additive = _elm_lang$virtual_dom$VirtualDom$attribute('additive');
var _elm_lang$svg$Svg_Attributes$accumulate = _elm_lang$virtual_dom$VirtualDom$attribute('accumulate');
var _elm_lang$svg$Svg_Attributes$accelerate = _elm_lang$virtual_dom$VirtualDom$attribute('accelerate');
var _elm_lang$svg$Svg_Attributes$accentHeight = _elm_lang$virtual_dom$VirtualDom$attribute('accent-height');

var _elm_lang$svg$Svg_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$svg$Svg_Events$simpleOn = F2(
	function (name, msg) {
		return A2(
			_elm_lang$svg$Svg_Events$on,
			name,
			_elm_lang$core$Json_Decode$succeed(msg));
	});
var _elm_lang$svg$Svg_Events$onBegin = _elm_lang$svg$Svg_Events$simpleOn('begin');
var _elm_lang$svg$Svg_Events$onEnd = _elm_lang$svg$Svg_Events$simpleOn('end');
var _elm_lang$svg$Svg_Events$onRepeat = _elm_lang$svg$Svg_Events$simpleOn('repeat');
var _elm_lang$svg$Svg_Events$onAbort = _elm_lang$svg$Svg_Events$simpleOn('abort');
var _elm_lang$svg$Svg_Events$onError = _elm_lang$svg$Svg_Events$simpleOn('error');
var _elm_lang$svg$Svg_Events$onResize = _elm_lang$svg$Svg_Events$simpleOn('resize');
var _elm_lang$svg$Svg_Events$onScroll = _elm_lang$svg$Svg_Events$simpleOn('scroll');
var _elm_lang$svg$Svg_Events$onLoad = _elm_lang$svg$Svg_Events$simpleOn('load');
var _elm_lang$svg$Svg_Events$onUnload = _elm_lang$svg$Svg_Events$simpleOn('unload');
var _elm_lang$svg$Svg_Events$onZoom = _elm_lang$svg$Svg_Events$simpleOn('zoom');
var _elm_lang$svg$Svg_Events$onActivate = _elm_lang$svg$Svg_Events$simpleOn('activate');
var _elm_lang$svg$Svg_Events$onClick = _elm_lang$svg$Svg_Events$simpleOn('click');
var _elm_lang$svg$Svg_Events$onFocusIn = _elm_lang$svg$Svg_Events$simpleOn('focusin');
var _elm_lang$svg$Svg_Events$onFocusOut = _elm_lang$svg$Svg_Events$simpleOn('focusout');
var _elm_lang$svg$Svg_Events$onMouseDown = _elm_lang$svg$Svg_Events$simpleOn('mousedown');
var _elm_lang$svg$Svg_Events$onMouseMove = _elm_lang$svg$Svg_Events$simpleOn('mousemove');
var _elm_lang$svg$Svg_Events$onMouseOut = _elm_lang$svg$Svg_Events$simpleOn('mouseout');
var _elm_lang$svg$Svg_Events$onMouseOver = _elm_lang$svg$Svg_Events$simpleOn('mouseover');
var _elm_lang$svg$Svg_Events$onMouseUp = _elm_lang$svg$Svg_Events$simpleOn('mouseup');

var _fredcy$elm_parseint$ParseInt$charFromInt = function (i) {
	return (_elm_lang$core$Native_Utils.cmp(i, 10) < 0) ? _elm_lang$core$Char$fromCode(
		i + _elm_lang$core$Char$toCode(
			_elm_lang$core$Native_Utils.chr('0'))) : ((_elm_lang$core$Native_Utils.cmp(i, 36) < 0) ? _elm_lang$core$Char$fromCode(
		(i - 10) + _elm_lang$core$Char$toCode(
			_elm_lang$core$Native_Utils.chr('A'))) : _elm_lang$core$Native_Utils.crash(
		'ParseInt',
		{
			start: {line: 158, column: 9},
			end: {line: 158, column: 20}
		})(
		_elm_lang$core$Basics$toString(i)));
};
var _fredcy$elm_parseint$ParseInt$toRadixUnsafe = F2(
	function (radix, i) {
		return (_elm_lang$core$Native_Utils.cmp(i, radix) < 0) ? _elm_lang$core$String$fromChar(
			_fredcy$elm_parseint$ParseInt$charFromInt(i)) : A2(
			_elm_lang$core$Basics_ops['++'],
			A2(_fredcy$elm_parseint$ParseInt$toRadixUnsafe, radix, (i / radix) | 0),
			_elm_lang$core$String$fromChar(
				_fredcy$elm_parseint$ParseInt$charFromInt(
					A2(_elm_lang$core$Basics_ops['%'], i, radix))));
	});
var _fredcy$elm_parseint$ParseInt$toOct = _fredcy$elm_parseint$ParseInt$toRadixUnsafe(8);
var _fredcy$elm_parseint$ParseInt$toHex = _fredcy$elm_parseint$ParseInt$toRadixUnsafe(16);
var _fredcy$elm_parseint$ParseInt$isBetween = F3(
	function (lower, upper, c) {
		var ci = _elm_lang$core$Char$toCode(c);
		return (_elm_lang$core$Native_Utils.cmp(
			_elm_lang$core$Char$toCode(lower),
			ci) < 1) && (_elm_lang$core$Native_Utils.cmp(
			ci,
			_elm_lang$core$Char$toCode(upper)) < 1);
	});
var _fredcy$elm_parseint$ParseInt$charOffset = F2(
	function (basis, c) {
		return _elm_lang$core$Char$toCode(c) - _elm_lang$core$Char$toCode(basis);
	});
var _fredcy$elm_parseint$ParseInt$InvalidRadix = function (a) {
	return {ctor: 'InvalidRadix', _0: a};
};
var _fredcy$elm_parseint$ParseInt$toRadix = F2(
	function (radix, i) {
		return ((_elm_lang$core$Native_Utils.cmp(2, radix) < 1) && (_elm_lang$core$Native_Utils.cmp(radix, 36) < 1)) ? ((_elm_lang$core$Native_Utils.cmp(i, 0) < 0) ? _elm_lang$core$Result$Ok(
			A2(
				_elm_lang$core$Basics_ops['++'],
				'-',
				A2(_fredcy$elm_parseint$ParseInt$toRadixUnsafe, radix, 0 - i))) : _elm_lang$core$Result$Ok(
			A2(_fredcy$elm_parseint$ParseInt$toRadixUnsafe, radix, i))) : _elm_lang$core$Result$Err(
			_fredcy$elm_parseint$ParseInt$InvalidRadix(radix));
	});
var _fredcy$elm_parseint$ParseInt$OutOfRange = function (a) {
	return {ctor: 'OutOfRange', _0: a};
};
var _fredcy$elm_parseint$ParseInt$InvalidChar = function (a) {
	return {ctor: 'InvalidChar', _0: a};
};
var _fredcy$elm_parseint$ParseInt$intFromChar = F2(
	function (radix, c) {
		var validInt = function (i) {
			return (_elm_lang$core$Native_Utils.cmp(i, radix) < 0) ? _elm_lang$core$Result$Ok(i) : _elm_lang$core$Result$Err(
				_fredcy$elm_parseint$ParseInt$OutOfRange(c));
		};
		var toInt = A3(
			_fredcy$elm_parseint$ParseInt$isBetween,
			_elm_lang$core$Native_Utils.chr('0'),
			_elm_lang$core$Native_Utils.chr('9'),
			c) ? _elm_lang$core$Result$Ok(
			A2(
				_fredcy$elm_parseint$ParseInt$charOffset,
				_elm_lang$core$Native_Utils.chr('0'),
				c)) : (A3(
			_fredcy$elm_parseint$ParseInt$isBetween,
			_elm_lang$core$Native_Utils.chr('a'),
			_elm_lang$core$Native_Utils.chr('z'),
			c) ? _elm_lang$core$Result$Ok(
			10 + A2(
				_fredcy$elm_parseint$ParseInt$charOffset,
				_elm_lang$core$Native_Utils.chr('a'),
				c)) : (A3(
			_fredcy$elm_parseint$ParseInt$isBetween,
			_elm_lang$core$Native_Utils.chr('A'),
			_elm_lang$core$Native_Utils.chr('Z'),
			c) ? _elm_lang$core$Result$Ok(
			10 + A2(
				_fredcy$elm_parseint$ParseInt$charOffset,
				_elm_lang$core$Native_Utils.chr('A'),
				c)) : _elm_lang$core$Result$Err(
			_fredcy$elm_parseint$ParseInt$InvalidChar(c))));
		return A2(_elm_lang$core$Result$andThen, validInt, toInt);
	});
var _fredcy$elm_parseint$ParseInt$parseIntR = F2(
	function (radix, rstring) {
		var _p0 = _elm_lang$core$String$uncons(rstring);
		if (_p0.ctor === 'Nothing') {
			return _elm_lang$core$Result$Ok(0);
		} else {
			return A2(
				_elm_lang$core$Result$andThen,
				function (ci) {
					return A2(
						_elm_lang$core$Result$andThen,
						function (ri) {
							return _elm_lang$core$Result$Ok(ci + (ri * radix));
						},
						A2(_fredcy$elm_parseint$ParseInt$parseIntR, radix, _p0._0._1));
				},
				A2(_fredcy$elm_parseint$ParseInt$intFromChar, radix, _p0._0._0));
		}
	});
var _fredcy$elm_parseint$ParseInt$parseIntRadix = F2(
	function (radix, string) {
		return ((_elm_lang$core$Native_Utils.cmp(2, radix) < 1) && (_elm_lang$core$Native_Utils.cmp(radix, 36) < 1)) ? A2(
			_fredcy$elm_parseint$ParseInt$parseIntR,
			radix,
			_elm_lang$core$String$reverse(string)) : _elm_lang$core$Result$Err(
			_fredcy$elm_parseint$ParseInt$InvalidRadix(radix));
	});
var _fredcy$elm_parseint$ParseInt$parseInt = _fredcy$elm_parseint$ParseInt$parseIntRadix(10);
var _fredcy$elm_parseint$ParseInt$parseIntOct = _fredcy$elm_parseint$ParseInt$parseIntRadix(8);
var _fredcy$elm_parseint$ParseInt$parseIntHex = _fredcy$elm_parseint$ParseInt$parseIntRadix(16);

var _eskimoblood$elm_color_extra$Color_Convert$xyzToColor = function (_p0) {
	var _p1 = _p0;
	var c = function (ch) {
		var ch_ = (_elm_lang$core$Native_Utils.cmp(ch, 3.1308e-3) > 0) ? ((1.055 * Math.pow(ch, 1 / 2.4)) - 5.5e-2) : (12.92 * ch);
		return _elm_lang$core$Basics$round(
			A3(_elm_lang$core$Basics$clamp, 0, 255, ch_ * 255));
	};
	var z_ = _p1.z / 100;
	var y_ = _p1.y / 100;
	var x_ = _p1.x / 100;
	var r = ((x_ * 3.2404542) + (y_ * -1.5371385)) + (z_ * -0.4986);
	var g = ((x_ * -0.969266) + (y_ * 1.8760108)) + (z_ * 4.1556e-2);
	var b = ((x_ * 5.56434e-2) + (y_ * -0.2040259)) + (z_ * 1.0572252);
	return A3(
		_elm_lang$core$Color$rgb,
		c(r),
		c(g),
		c(b));
};
var _eskimoblood$elm_color_extra$Color_Convert$labToXyz = function (_p2) {
	var _p3 = _p2;
	var y = (_p3.l + 16) / 116;
	var c = function (ch) {
		var ch_ = (ch * ch) * ch;
		return (_elm_lang$core$Native_Utils.cmp(ch_, 8.856e-3) > 0) ? ch_ : ((ch - (16 / 116)) / 7.787);
	};
	return {
		y: c(y) * 100,
		x: c(y + (_p3.a / 500)) * 95.047,
		z: c(y - (_p3.b / 200)) * 108.883
	};
};
var _eskimoblood$elm_color_extra$Color_Convert$labToColor = function (_p4) {
	return _eskimoblood$elm_color_extra$Color_Convert$xyzToColor(
		_eskimoblood$elm_color_extra$Color_Convert$labToXyz(_p4));
};
var _eskimoblood$elm_color_extra$Color_Convert$xyzToLab = function (_p5) {
	var _p6 = _p5;
	var c = function (ch) {
		return (_elm_lang$core$Native_Utils.cmp(ch, 8.856e-3) > 0) ? Math.pow(ch, 1 / 3) : ((7.787 * ch) + (16 / 116));
	};
	var x_ = c(_p6.x / 95.047);
	var y_ = c(_p6.y / 100);
	var z_ = c(_p6.z / 108.883);
	return {l: (116 * y_) - 16, a: 500 * (x_ - y_), b: 200 * (y_ - z_)};
};
var _eskimoblood$elm_color_extra$Color_Convert$colorToXyz = function (cl) {
	var _p7 = _elm_lang$core$Color$toRgb(cl);
	var red = _p7.red;
	var green = _p7.green;
	var blue = _p7.blue;
	var c = function (ch) {
		var ch_ = _elm_lang$core$Basics$toFloat(ch) / 255;
		var ch__ = (_elm_lang$core$Native_Utils.cmp(ch_, 4.045e-2) > 0) ? Math.pow((ch_ + 5.5e-2) / 1.055, 2.4) : (ch_ / 12.92);
		return ch__ * 100;
	};
	var r = c(red);
	var g = c(green);
	var b = c(blue);
	return {x: ((r * 0.4124) + (g * 0.3576)) + (b * 0.1805), y: ((r * 0.2126) + (g * 0.7152)) + (b * 7.22e-2), z: ((r * 1.93e-2) + (g * 0.1192)) + (b * 0.9505)};
};
var _eskimoblood$elm_color_extra$Color_Convert$colorToLab = function (_p8) {
	return _eskimoblood$elm_color_extra$Color_Convert$xyzToLab(
		_eskimoblood$elm_color_extra$Color_Convert$colorToXyz(_p8));
};
var _eskimoblood$elm_color_extra$Color_Convert$toRadix = function (n) {
	var getChr = function (c) {
		return (_elm_lang$core$Native_Utils.cmp(c, 10) < 0) ? _elm_lang$core$Basics$toString(c) : _elm_lang$core$String$fromChar(
			_elm_lang$core$Char$fromCode(87 + c));
	};
	return (_elm_lang$core$Native_Utils.cmp(n, 16) < 0) ? getChr(n) : A2(
		_elm_lang$core$Basics_ops['++'],
		_eskimoblood$elm_color_extra$Color_Convert$toRadix((n / 16) | 0),
		getChr(
			A2(_elm_lang$core$Basics_ops['%'], n, 16)));
};
var _eskimoblood$elm_color_extra$Color_Convert$toHex = function (_p9) {
	return A3(
		_elm_lang$core$String$padLeft,
		2,
		_elm_lang$core$Native_Utils.chr('0'),
		_eskimoblood$elm_color_extra$Color_Convert$toRadix(_p9));
};
var _eskimoblood$elm_color_extra$Color_Convert$colorToHex = function (cl) {
	var _p10 = _elm_lang$core$Color$toRgb(cl);
	var red = _p10.red;
	var green = _p10.green;
	var blue = _p10.blue;
	return A2(
		_elm_lang$core$String$join,
		'',
		A2(
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			'#',
			A2(
				_elm_lang$core$List$map,
				_eskimoblood$elm_color_extra$Color_Convert$toHex,
				{
					ctor: '::',
					_0: red,
					_1: {
						ctor: '::',
						_0: green,
						_1: {
							ctor: '::',
							_0: blue,
							_1: {ctor: '[]'}
						}
					}
				})));
};
var _eskimoblood$elm_color_extra$Color_Convert$hexToColor = function () {
	var pattern = A2(
		_elm_lang$core$Basics_ops['++'],
		'',
		A2(
			_elm_lang$core$Basics_ops['++'],
			'^',
			A2(
				_elm_lang$core$Basics_ops['++'],
				'#?',
				A2(
					_elm_lang$core$Basics_ops['++'],
					'(?:',
					A2(
						_elm_lang$core$Basics_ops['++'],
						'(?:([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2}))',
						A2(
							_elm_lang$core$Basics_ops['++'],
							'|',
							A2(
								_elm_lang$core$Basics_ops['++'],
								'(?:([a-f\\d])([a-f\\d])([a-f\\d]))',
								A2(_elm_lang$core$Basics_ops['++'], ')', '$'))))))));
	var extend = function (token) {
		var _p11 = _elm_lang$core$String$toList(token);
		if ((_p11.ctor === '::') && (_p11._1.ctor === '[]')) {
			var _p12 = _p11._0;
			return _elm_lang$core$String$fromList(
				{
					ctor: '::',
					_0: _p12,
					_1: {
						ctor: '::',
						_0: _p12,
						_1: {ctor: '[]'}
					}
				});
		} else {
			return token;
		}
	};
	return function (_p13) {
		return A2(
			_elm_lang$core$Result$andThen,
			function (colors) {
				var _p15 = A2(
					_elm_lang$core$List$map,
					function (_p14) {
						return _fredcy$elm_parseint$ParseInt$parseIntHex(
							extend(_p14));
					},
					colors);
				if (((((((_p15.ctor === '::') && (_p15._0.ctor === 'Ok')) && (_p15._1.ctor === '::')) && (_p15._1._0.ctor === 'Ok')) && (_p15._1._1.ctor === '::')) && (_p15._1._1._0.ctor === 'Ok')) && (_p15._1._1._1.ctor === '[]')) {
					return _elm_lang$core$Result$Ok(
						A3(_elm_lang$core$Color$rgb, _p15._0._0, _p15._1._0._0, _p15._1._1._0._0));
				} else {
					return _elm_lang$core$Result$Err('Parsing ints from hex failed');
				}
			},
			A2(
				_elm_lang$core$Result$fromMaybe,
				'Parsing hex regex failed',
				A2(
					_elm_lang$core$Maybe$map,
					_elm_lang$core$List$filterMap(_elm_lang$core$Basics$identity),
					A2(
						_elm_lang$core$Maybe$map,
						function (_) {
							return _.submatches;
						},
						_elm_lang$core$List$head(
							A3(
								_elm_lang$core$Regex$find,
								_elm_lang$core$Regex$AtMost(1),
								_elm_lang$core$Regex$regex(pattern),
								_elm_lang$core$String$toLower(_p13)))))));
	};
}();
var _eskimoblood$elm_color_extra$Color_Convert$cssColorString = F2(
	function (kind, values) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			kind,
			A2(
				_elm_lang$core$Basics_ops['++'],
				'(',
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(_elm_lang$core$String$join, ', ', values),
					')')));
	});
var _eskimoblood$elm_color_extra$Color_Convert$toPercentString = function (_p16) {
	return A3(
		_elm_lang$core$Basics$flip,
		F2(
			function (x, y) {
				return A2(_elm_lang$core$Basics_ops['++'], x, y);
			}),
		'%',
		_elm_lang$core$Basics$toString(
			_elm_lang$core$Basics$round(
				A2(
					F2(
						function (x, y) {
							return x * y;
						}),
					100,
					_p16))));
};
var _eskimoblood$elm_color_extra$Color_Convert$hueToString = function (_p17) {
	return _elm_lang$core$Basics$toString(
		_elm_lang$core$Basics$round(
			A3(
				_elm_lang$core$Basics$flip,
				F2(
					function (x, y) {
						return x / y;
					}),
				_elm_lang$core$Basics$pi,
				A2(
					F2(
						function (x, y) {
							return x * y;
						}),
					180,
					_p17))));
};
var _eskimoblood$elm_color_extra$Color_Convert$colorToCssHsla = function (cl) {
	var _p18 = _elm_lang$core$Color$toHsl(cl);
	var hue = _p18.hue;
	var saturation = _p18.saturation;
	var lightness = _p18.lightness;
	var alpha = _p18.alpha;
	return A2(
		_eskimoblood$elm_color_extra$Color_Convert$cssColorString,
		'hsla',
		{
			ctor: '::',
			_0: _eskimoblood$elm_color_extra$Color_Convert$hueToString(hue),
			_1: {
				ctor: '::',
				_0: _eskimoblood$elm_color_extra$Color_Convert$toPercentString(saturation),
				_1: {
					ctor: '::',
					_0: _eskimoblood$elm_color_extra$Color_Convert$toPercentString(lightness),
					_1: {
						ctor: '::',
						_0: _elm_lang$core$Basics$toString(alpha),
						_1: {ctor: '[]'}
					}
				}
			}
		});
};
var _eskimoblood$elm_color_extra$Color_Convert$colorToCssHsl = function (cl) {
	var _p19 = _elm_lang$core$Color$toHsl(cl);
	var hue = _p19.hue;
	var saturation = _p19.saturation;
	var lightness = _p19.lightness;
	var alpha = _p19.alpha;
	return A2(
		_eskimoblood$elm_color_extra$Color_Convert$cssColorString,
		'hsl',
		{
			ctor: '::',
			_0: _eskimoblood$elm_color_extra$Color_Convert$hueToString(hue),
			_1: {
				ctor: '::',
				_0: _eskimoblood$elm_color_extra$Color_Convert$toPercentString(saturation),
				_1: {
					ctor: '::',
					_0: _eskimoblood$elm_color_extra$Color_Convert$toPercentString(lightness),
					_1: {ctor: '[]'}
				}
			}
		});
};
var _eskimoblood$elm_color_extra$Color_Convert$colorToCssRgba = function (cl) {
	var _p20 = _elm_lang$core$Color$toRgb(cl);
	var red = _p20.red;
	var green = _p20.green;
	var blue = _p20.blue;
	var alpha = _p20.alpha;
	return A2(
		_eskimoblood$elm_color_extra$Color_Convert$cssColorString,
		'rgba',
		{
			ctor: '::',
			_0: _elm_lang$core$Basics$toString(red),
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Basics$toString(green),
				_1: {
					ctor: '::',
					_0: _elm_lang$core$Basics$toString(blue),
					_1: {
						ctor: '::',
						_0: _elm_lang$core$Basics$toString(alpha),
						_1: {ctor: '[]'}
					}
				}
			}
		});
};
var _eskimoblood$elm_color_extra$Color_Convert$colorToCssRgb = function (cl) {
	var _p21 = _elm_lang$core$Color$toRgb(cl);
	var red = _p21.red;
	var green = _p21.green;
	var blue = _p21.blue;
	var alpha = _p21.alpha;
	return A2(
		_eskimoblood$elm_color_extra$Color_Convert$cssColorString,
		'rgb',
		{
			ctor: '::',
			_0: _elm_lang$core$Basics$toString(red),
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Basics$toString(green),
				_1: {
					ctor: '::',
					_0: _elm_lang$core$Basics$toString(blue),
					_1: {ctor: '[]'}
				}
			}
		});
};
var _eskimoblood$elm_color_extra$Color_Convert$XYZ = F3(
	function (a, b, c) {
		return {x: a, y: b, z: c};
	});
var _eskimoblood$elm_color_extra$Color_Convert$Lab = F3(
	function (a, b, c) {
		return {l: a, a: b, b: c};
	});

var _eskimoblood$elm_color_extra$Color_Manipulate$mixChannel = F3(
	function (weight, c1, c2) {
		return _elm_lang$core$Basics$round(
			(_elm_lang$core$Basics$toFloat(c1) * weight) + (_elm_lang$core$Basics$toFloat(c2) * (1 - weight)));
	});
var _eskimoblood$elm_color_extra$Color_Manipulate$calculateWeight = F3(
	function (a1, a2, weight) {
		var w1 = (weight * 2) - 1;
		var a = a1 - a2;
		var w2 = _elm_lang$core$Native_Utils.eq(w1 * a, -1) ? w1 : ((w1 + a) / (1 + (w1 * a)));
		return (w2 + 1) / 2;
	});
var _eskimoblood$elm_color_extra$Color_Manipulate$weightedMix = F3(
	function (color1, color2, weight) {
		var c2 = _elm_lang$core$Color$toRgb(color2);
		var c1 = _elm_lang$core$Color$toRgb(color1);
		var clampedWeight = A3(_elm_lang$core$Basics$clamp, 0, 1, weight);
		var w = A3(_eskimoblood$elm_color_extra$Color_Manipulate$calculateWeight, c1.alpha, c2.alpha, clampedWeight);
		var rMixed = A3(_eskimoblood$elm_color_extra$Color_Manipulate$mixChannel, w, c1.red, c2.red);
		var gMixed = A3(_eskimoblood$elm_color_extra$Color_Manipulate$mixChannel, w, c1.green, c2.green);
		var bMixed = A3(_eskimoblood$elm_color_extra$Color_Manipulate$mixChannel, w, c1.blue, c2.blue);
		var alphaMixed = (c1.alpha * clampedWeight) + (c2.alpha * (1 - clampedWeight));
		return A4(_elm_lang$core$Color$rgba, rMixed, gMixed, bMixed, alphaMixed);
	});
var _eskimoblood$elm_color_extra$Color_Manipulate$mix = F2(
	function (c1, c2) {
		return A3(_eskimoblood$elm_color_extra$Color_Manipulate$weightedMix, c1, c2, 0.5);
	});
var _eskimoblood$elm_color_extra$Color_Manipulate$scale = F3(
	function (max, scaleAmount, value) {
		var clampedValue = A3(_elm_lang$core$Basics$clamp, 0, max, value);
		var clampedScale = A3(_elm_lang$core$Basics$clamp, -1.0, 1.0, scaleAmount);
		var diff = (_elm_lang$core$Native_Utils.cmp(clampedScale, 0) > 0) ? (max - clampedValue) : clampedValue;
		return clampedValue + (diff * clampedScale);
	});
var _eskimoblood$elm_color_extra$Color_Manipulate$scaleRgb = F2(
	function (scaleBy, color) {
		var rgb = _elm_lang$core$Color$toRgb(color);
		var _p0 = scaleBy;
		var rScale = _p0._0;
		var gScale = _p0._1;
		var bScale = _p0._2;
		var aScale = _p0._3;
		return A4(
			_elm_lang$core$Color$rgba,
			_elm_lang$core$Basics$round(
				A3(
					_eskimoblood$elm_color_extra$Color_Manipulate$scale,
					255,
					rScale,
					_elm_lang$core$Basics$toFloat(rgb.red))),
			_elm_lang$core$Basics$round(
				A3(
					_eskimoblood$elm_color_extra$Color_Manipulate$scale,
					255,
					gScale,
					_elm_lang$core$Basics$toFloat(rgb.green))),
			_elm_lang$core$Basics$round(
				A3(
					_eskimoblood$elm_color_extra$Color_Manipulate$scale,
					255,
					bScale,
					_elm_lang$core$Basics$toFloat(rgb.blue))),
			A3(_eskimoblood$elm_color_extra$Color_Manipulate$scale, 1.0, aScale, rgb.alpha));
	});
var _eskimoblood$elm_color_extra$Color_Manipulate$scaleHsl = F2(
	function (scaleBy, color) {
		var hsl = _elm_lang$core$Color$toHsl(color);
		var _p1 = scaleBy;
		var saturationScale = _p1._0;
		var lightnessScale = _p1._1;
		var alphaScale = _p1._2;
		return A4(
			_elm_lang$core$Color$hsla,
			hsl.hue,
			A3(_eskimoblood$elm_color_extra$Color_Manipulate$scale, 1.0, saturationScale, hsl.saturation),
			A3(_eskimoblood$elm_color_extra$Color_Manipulate$scale, 1.0, lightnessScale, hsl.lightness),
			A3(_eskimoblood$elm_color_extra$Color_Manipulate$scale, 1.0, alphaScale, hsl.alpha));
	});
var _eskimoblood$elm_color_extra$Color_Manipulate$rotateHue = F2(
	function (angle, cl) {
		var _p2 = _elm_lang$core$Color$toHsl(cl);
		var hue = _p2.hue;
		var saturation = _p2.saturation;
		var lightness = _p2.lightness;
		var alpha = _p2.alpha;
		return A4(
			_elm_lang$core$Color$hsla,
			hue + _elm_lang$core$Basics$degrees(angle),
			saturation,
			lightness,
			alpha);
	});
var _eskimoblood$elm_color_extra$Color_Manipulate$limit = A2(_elm_lang$core$Basics$clamp, 0, 1);
var _eskimoblood$elm_color_extra$Color_Manipulate$darken = F2(
	function (offset, cl) {
		var _p3 = _elm_lang$core$Color$toHsl(cl);
		var hue = _p3.hue;
		var saturation = _p3.saturation;
		var lightness = _p3.lightness;
		var alpha = _p3.alpha;
		return A4(
			_elm_lang$core$Color$hsla,
			hue,
			saturation,
			_eskimoblood$elm_color_extra$Color_Manipulate$limit(lightness - offset),
			alpha);
	});
var _eskimoblood$elm_color_extra$Color_Manipulate$lighten = F2(
	function (offset, cl) {
		return A2(_eskimoblood$elm_color_extra$Color_Manipulate$darken, 0 - offset, cl);
	});
var _eskimoblood$elm_color_extra$Color_Manipulate$saturate = F2(
	function (offset, cl) {
		var _p4 = _elm_lang$core$Color$toHsl(cl);
		var hue = _p4.hue;
		var saturation = _p4.saturation;
		var lightness = _p4.lightness;
		var alpha = _p4.alpha;
		return A4(
			_elm_lang$core$Color$hsla,
			hue,
			_eskimoblood$elm_color_extra$Color_Manipulate$limit(saturation + offset),
			lightness,
			alpha);
	});
var _eskimoblood$elm_color_extra$Color_Manipulate$desaturate = F2(
	function (offset, cl) {
		return A2(_eskimoblood$elm_color_extra$Color_Manipulate$saturate, 0 - offset, cl);
	});
var _eskimoblood$elm_color_extra$Color_Manipulate$grayscale = function (cl) {
	return A2(_eskimoblood$elm_color_extra$Color_Manipulate$saturate, -1, cl);
};
var _eskimoblood$elm_color_extra$Color_Manipulate$fadeIn = F2(
	function (offset, cl) {
		var _p5 = _elm_lang$core$Color$toHsl(cl);
		var hue = _p5.hue;
		var saturation = _p5.saturation;
		var lightness = _p5.lightness;
		var alpha = _p5.alpha;
		return A4(
			_elm_lang$core$Color$hsla,
			hue,
			saturation,
			lightness,
			_eskimoblood$elm_color_extra$Color_Manipulate$limit(alpha + offset));
	});
var _eskimoblood$elm_color_extra$Color_Manipulate$fadeOut = F2(
	function (offset, cl) {
		return A2(_eskimoblood$elm_color_extra$Color_Manipulate$fadeIn, 0 - offset, cl);
	});

var _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerSecond = 1000;
var _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute = 60 * _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerSecond;
var _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerHour = 60 * _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute;
var _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerDay = 24 * _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerHour;
var _justinmimbs$elm_date_extra$Date_Extra_Facts$dayOfWeekFromWeekdayNumber = function (n) {
	var _p0 = n;
	switch (_p0) {
		case 1:
			return _elm_lang$core$Date$Mon;
		case 2:
			return _elm_lang$core$Date$Tue;
		case 3:
			return _elm_lang$core$Date$Wed;
		case 4:
			return _elm_lang$core$Date$Thu;
		case 5:
			return _elm_lang$core$Date$Fri;
		case 6:
			return _elm_lang$core$Date$Sat;
		default:
			return _elm_lang$core$Date$Sun;
	}
};
var _justinmimbs$elm_date_extra$Date_Extra_Facts$weekdayNumberFromDayOfWeek = function (d) {
	var _p1 = d;
	switch (_p1.ctor) {
		case 'Mon':
			return 1;
		case 'Tue':
			return 2;
		case 'Wed':
			return 3;
		case 'Thu':
			return 4;
		case 'Fri':
			return 5;
		case 'Sat':
			return 6;
		default:
			return 7;
	}
};
var _justinmimbs$elm_date_extra$Date_Extra_Facts$monthFromMonthNumber = function (n) {
	var _p2 = n;
	switch (_p2) {
		case 1:
			return _elm_lang$core$Date$Jan;
		case 2:
			return _elm_lang$core$Date$Feb;
		case 3:
			return _elm_lang$core$Date$Mar;
		case 4:
			return _elm_lang$core$Date$Apr;
		case 5:
			return _elm_lang$core$Date$May;
		case 6:
			return _elm_lang$core$Date$Jun;
		case 7:
			return _elm_lang$core$Date$Jul;
		case 8:
			return _elm_lang$core$Date$Aug;
		case 9:
			return _elm_lang$core$Date$Sep;
		case 10:
			return _elm_lang$core$Date$Oct;
		case 11:
			return _elm_lang$core$Date$Nov;
		default:
			return _elm_lang$core$Date$Dec;
	}
};
var _justinmimbs$elm_date_extra$Date_Extra_Facts$monthNumberFromMonth = function (m) {
	var _p3 = m;
	switch (_p3.ctor) {
		case 'Jan':
			return 1;
		case 'Feb':
			return 2;
		case 'Mar':
			return 3;
		case 'Apr':
			return 4;
		case 'May':
			return 5;
		case 'Jun':
			return 6;
		case 'Jul':
			return 7;
		case 'Aug':
			return 8;
		case 'Sep':
			return 9;
		case 'Oct':
			return 10;
		case 'Nov':
			return 11;
		default:
			return 12;
	}
};
var _justinmimbs$elm_date_extra$Date_Extra_Facts$months = {
	ctor: '::',
	_0: _elm_lang$core$Date$Jan,
	_1: {
		ctor: '::',
		_0: _elm_lang$core$Date$Feb,
		_1: {
			ctor: '::',
			_0: _elm_lang$core$Date$Mar,
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Date$Apr,
				_1: {
					ctor: '::',
					_0: _elm_lang$core$Date$May,
					_1: {
						ctor: '::',
						_0: _elm_lang$core$Date$Jun,
						_1: {
							ctor: '::',
							_0: _elm_lang$core$Date$Jul,
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Date$Aug,
								_1: {
									ctor: '::',
									_0: _elm_lang$core$Date$Sep,
									_1: {
										ctor: '::',
										_0: _elm_lang$core$Date$Oct,
										_1: {
											ctor: '::',
											_0: _elm_lang$core$Date$Nov,
											_1: {
												ctor: '::',
												_0: _elm_lang$core$Date$Dec,
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear = function (y) {
	return (_elm_lang$core$Native_Utils.eq(
		A2(_elm_lang$core$Basics_ops['%'], y, 4),
		0) && (!_elm_lang$core$Native_Utils.eq(
		A2(_elm_lang$core$Basics_ops['%'], y, 100),
		0))) || _elm_lang$core$Native_Utils.eq(
		A2(_elm_lang$core$Basics_ops['%'], y, 400),
		0);
};
var _justinmimbs$elm_date_extra$Date_Extra_Facts$daysInMonth = F2(
	function (y, m) {
		var _p4 = m;
		switch (_p4.ctor) {
			case 'Jan':
				return 31;
			case 'Feb':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 29 : 28;
			case 'Mar':
				return 31;
			case 'Apr':
				return 30;
			case 'May':
				return 31;
			case 'Jun':
				return 30;
			case 'Jul':
				return 31;
			case 'Aug':
				return 31;
			case 'Sep':
				return 30;
			case 'Oct':
				return 31;
			case 'Nov':
				return 30;
			default:
				return 31;
		}
	});
var _justinmimbs$elm_date_extra$Date_Extra_Facts$daysBeforeStartOfMonth = F2(
	function (y, m) {
		var _p5 = m;
		switch (_p5.ctor) {
			case 'Jan':
				return 0;
			case 'Feb':
				return 31;
			case 'Mar':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 60 : 59;
			case 'Apr':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 91 : 90;
			case 'May':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 121 : 120;
			case 'Jun':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 152 : 151;
			case 'Jul':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 182 : 181;
			case 'Aug':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 213 : 212;
			case 'Sep':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 244 : 243;
			case 'Oct':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 274 : 273;
			case 'Nov':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 305 : 304;
			default:
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 335 : 334;
		}
	});

var _justinmimbs$elm_date_extra$Date_Internal_RataDie$divideInt = F2(
	function (a, b) {
		return {
			ctor: '_Tuple2',
			_0: (a / b) | 0,
			_1: A2(_elm_lang$core$Basics$rem, a, b)
		};
	});
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$year = function (rd) {
	var _p0 = A2(_justinmimbs$elm_date_extra$Date_Internal_RataDie$divideInt, rd, 146097);
	var n400 = _p0._0;
	var r400 = _p0._1;
	var _p1 = A2(_justinmimbs$elm_date_extra$Date_Internal_RataDie$divideInt, r400, 36524);
	var n100 = _p1._0;
	var r100 = _p1._1;
	var _p2 = A2(_justinmimbs$elm_date_extra$Date_Internal_RataDie$divideInt, r100, 1461);
	var n4 = _p2._0;
	var r4 = _p2._1;
	var _p3 = A2(_justinmimbs$elm_date_extra$Date_Internal_RataDie$divideInt, r4, 365);
	var n1 = _p3._0;
	var r1 = _p3._1;
	var n = _elm_lang$core$Native_Utils.eq(r1, 0) ? 0 : 1;
	return ((((n400 * 400) + (n100 * 100)) + (n4 * 4)) + n1) + n;
};
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$weekdayNumber = function (rd) {
	var _p4 = A2(_elm_lang$core$Basics_ops['%'], rd, 7);
	if (_p4 === 0) {
		return 7;
	} else {
		return _p4;
	}
};
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$daysBeforeYear = function (y1) {
	var y = y1 - 1;
	var leapYears = (((y / 4) | 0) - ((y / 100) | 0)) + ((y / 400) | 0);
	return (365 * y) + leapYears;
};
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$daysBeforeWeekYear = function (y) {
	var jan4 = _justinmimbs$elm_date_extra$Date_Internal_RataDie$daysBeforeYear(y) + 4;
	return jan4 - _justinmimbs$elm_date_extra$Date_Internal_RataDie$weekdayNumber(jan4);
};
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$weekYear = function (rd) {
	return _justinmimbs$elm_date_extra$Date_Internal_RataDie$year(
		rd + (4 - _justinmimbs$elm_date_extra$Date_Internal_RataDie$weekdayNumber(rd)));
};
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$weekNumber = function (rd) {
	var week1Day1 = _justinmimbs$elm_date_extra$Date_Internal_RataDie$daysBeforeWeekYear(
		_justinmimbs$elm_date_extra$Date_Internal_RataDie$weekYear(rd)) + 1;
	return (((rd - week1Day1) / 7) | 0) + 1;
};
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$fromWeekDate = F3(
	function (wy, wn, wdn) {
		return (_justinmimbs$elm_date_extra$Date_Internal_RataDie$daysBeforeWeekYear(wy) + ((wn - 1) * 7)) + wdn;
	});
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$fromCalendarDate = F3(
	function (y, m, d) {
		return (_justinmimbs$elm_date_extra$Date_Internal_RataDie$daysBeforeYear(y) + A2(_justinmimbs$elm_date_extra$Date_Extra_Facts$daysBeforeStartOfMonth, y, m)) + d;
	});
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$fromOrdinalDate = F2(
	function (y, od) {
		return _justinmimbs$elm_date_extra$Date_Internal_RataDie$daysBeforeYear(y) + od;
	});

var _justinmimbs$elm_date_extra$Date_Internal_Core$msFromTimeParts = F4(
	function (hh, mm, ss, ms) {
		return (((_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerHour * hh) + (_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute * mm)) + (_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerSecond * ss)) + ms;
	});
var _justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromRataDie = function (rd) {
	return (rd - 719163) * _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerDay;
};
var _justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromOrdinalDate = F2(
	function (y, d) {
		return _justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromRataDie(
			A2(_justinmimbs$elm_date_extra$Date_Internal_RataDie$fromOrdinalDate, y, d));
	});
var _justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromCalendarDate = F3(
	function (y, m, d) {
		return _justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromRataDie(
			A3(_justinmimbs$elm_date_extra$Date_Internal_RataDie$fromCalendarDate, y, m, d));
	});
var _justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromParts = F7(
	function (y, m, d, hh, mm, ss, ms) {
		return A3(_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromCalendarDate, y, m, d) + A4(_justinmimbs$elm_date_extra$Date_Internal_Core$msFromTimeParts, hh, mm, ss, ms);
	});
var _justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromWeekDate = F3(
	function (y, w, d) {
		return _justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromRataDie(
			A3(_justinmimbs$elm_date_extra$Date_Internal_RataDie$fromWeekDate, y, w, d));
	});
var _justinmimbs$elm_date_extra$Date_Internal_Core$weekNumberFromCalendarDate = F3(
	function (y, m, d) {
		return _justinmimbs$elm_date_extra$Date_Internal_RataDie$weekNumber(
			A3(_justinmimbs$elm_date_extra$Date_Internal_RataDie$fromCalendarDate, y, m, d));
	});
var _justinmimbs$elm_date_extra$Date_Internal_Core$weekYearFromCalendarDate = F3(
	function (y, m, d) {
		return _justinmimbs$elm_date_extra$Date_Internal_RataDie$weekYear(
			A3(_justinmimbs$elm_date_extra$Date_Internal_RataDie$fromCalendarDate, y, m, d));
	});

var _justinmimbs$elm_date_extra$Date_Internal_Extract$msOffsetFromUtc = function (date) {
	var utcTime = _elm_lang$core$Date$toTime(date);
	var localTime = _elm_lang$core$Basics$toFloat(
		A7(
			_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromParts,
			_elm_lang$core$Date$year(date),
			_elm_lang$core$Date$month(date),
			_elm_lang$core$Date$day(date),
			_elm_lang$core$Date$hour(date),
			_elm_lang$core$Date$minute(date),
			_elm_lang$core$Date$second(date),
			_elm_lang$core$Date$millisecond(date)));
	return _elm_lang$core$Basics$floor(localTime - utcTime);
};
var _justinmimbs$elm_date_extra$Date_Internal_Extract$offsetFromUtc = function (date) {
	return (_justinmimbs$elm_date_extra$Date_Internal_Extract$msOffsetFromUtc(date) / _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute) | 0;
};
var _justinmimbs$elm_date_extra$Date_Internal_Extract$weekYear = function (date) {
	return A3(
		_justinmimbs$elm_date_extra$Date_Internal_Core$weekYearFromCalendarDate,
		_elm_lang$core$Date$year(date),
		_elm_lang$core$Date$month(date),
		_elm_lang$core$Date$day(date));
};
var _justinmimbs$elm_date_extra$Date_Internal_Extract$weekNumber = function (date) {
	return A3(
		_justinmimbs$elm_date_extra$Date_Internal_Core$weekNumberFromCalendarDate,
		_elm_lang$core$Date$year(date),
		_elm_lang$core$Date$month(date),
		_elm_lang$core$Date$day(date));
};
var _justinmimbs$elm_date_extra$Date_Internal_Extract$weekdayNumber = function (_p0) {
	return _justinmimbs$elm_date_extra$Date_Extra_Facts$weekdayNumberFromDayOfWeek(
		_elm_lang$core$Date$dayOfWeek(_p0));
};
var _justinmimbs$elm_date_extra$Date_Internal_Extract$fractionalDay = function (date) {
	var timeOfDayMS = A4(
		_justinmimbs$elm_date_extra$Date_Internal_Core$msFromTimeParts,
		_elm_lang$core$Date$hour(date),
		_elm_lang$core$Date$minute(date),
		_elm_lang$core$Date$second(date),
		_elm_lang$core$Date$millisecond(date));
	return _elm_lang$core$Basics$toFloat(timeOfDayMS) / _elm_lang$core$Basics$toFloat(_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerDay);
};
var _justinmimbs$elm_date_extra$Date_Internal_Extract$ordinalDay = function (date) {
	return A2(
		_justinmimbs$elm_date_extra$Date_Extra_Facts$daysBeforeStartOfMonth,
		_elm_lang$core$Date$year(date),
		_elm_lang$core$Date$month(date)) + _elm_lang$core$Date$day(date);
};
var _justinmimbs$elm_date_extra$Date_Internal_Extract$monthNumber = function (_p1) {
	return _justinmimbs$elm_date_extra$Date_Extra_Facts$monthNumberFromMonth(
		_elm_lang$core$Date$month(_p1));
};
var _justinmimbs$elm_date_extra$Date_Internal_Extract$quarter = function (date) {
	return _elm_lang$core$Basics$ceiling(
		function (n) {
			return n / 3;
		}(
			_elm_lang$core$Basics$toFloat(
				_justinmimbs$elm_date_extra$Date_Internal_Extract$monthNumber(date))));
};

var _justinmimbs$elm_date_extra$Date_Internal_Format$toUtc = function (date) {
	return _elm_lang$core$Date$fromTime(
		_elm_lang$core$Date$toTime(date) - _elm_lang$core$Basics$toFloat(
			_justinmimbs$elm_date_extra$Date_Internal_Extract$offsetFromUtc(date) * _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute));
};
var _justinmimbs$elm_date_extra$Date_Internal_Format$nameForm = function (length) {
	var _p0 = length;
	switch (_p0) {
		case 1:
			return 'abbreviated';
		case 2:
			return 'abbreviated';
		case 3:
			return 'abbreviated';
		case 4:
			return 'full';
		case 5:
			return 'narrow';
		case 6:
			return 'short';
		default:
			return 'invalid';
	}
};
var _justinmimbs$elm_date_extra$Date_Internal_Format$patternMatches = _elm_lang$core$Regex$regex('([yYQMwdDEeabhHmsSXx])\\1*|\'(?:[^\']|\'\')*?\'(?!\')');
var _justinmimbs$elm_date_extra$Date_Internal_Format$formatTimeOffset = F3(
	function (separator, minutesOptional, offset) {
		var mm = A3(
			_elm_lang$core$String$padLeft,
			2,
			_elm_lang$core$Native_Utils.chr('0'),
			_elm_lang$core$Basics$toString(
				A2(
					_elm_lang$core$Basics_ops['%'],
					_elm_lang$core$Basics$abs(offset),
					60)));
		var hh = A3(
			_elm_lang$core$String$padLeft,
			2,
			_elm_lang$core$Native_Utils.chr('0'),
			_elm_lang$core$Basics$toString(
				(_elm_lang$core$Basics$abs(offset) / 60) | 0));
		var sign = (_elm_lang$core$Native_Utils.cmp(offset, 0) > -1) ? '+' : '-';
		return (minutesOptional && _elm_lang$core$Native_Utils.eq(mm, '00')) ? A2(_elm_lang$core$Basics_ops['++'], sign, hh) : A2(
			_elm_lang$core$Basics_ops['++'],
			sign,
			A2(
				_elm_lang$core$Basics_ops['++'],
				hh,
				A2(_elm_lang$core$Basics_ops['++'], separator, mm)));
	});
var _justinmimbs$elm_date_extra$Date_Internal_Format$ordinalSuffix = function (n) {
	var nn = A2(_elm_lang$core$Basics_ops['%'], n, 100);
	var _p1 = A2(
		_elm_lang$core$Basics$min,
		(_elm_lang$core$Native_Utils.cmp(nn, 20) < 0) ? nn : A2(_elm_lang$core$Basics_ops['%'], nn, 10),
		4);
	switch (_p1) {
		case 0:
			return 'th';
		case 1:
			return 'st';
		case 2:
			return 'nd';
		case 3:
			return 'rd';
		case 4:
			return 'th';
		default:
			return '';
	}
};
var _justinmimbs$elm_date_extra$Date_Internal_Format$withOrdinalSuffix = function (n) {
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_elm_lang$core$Basics$toString(n),
		_justinmimbs$elm_date_extra$Date_Internal_Format$ordinalSuffix(n));
};
var _justinmimbs$elm_date_extra$Date_Internal_Format$hour12 = function (date) {
	var _p2 = A2(
		_elm_lang$core$Basics_ops['%'],
		_elm_lang$core$Date$hour(date),
		12);
	if (_p2 === 0) {
		return 12;
	} else {
		return _p2;
	}
};
var _justinmimbs$elm_date_extra$Date_Internal_Format$dayOfWeekName = function (d) {
	var _p3 = d;
	switch (_p3.ctor) {
		case 'Mon':
			return 'Monday';
		case 'Tue':
			return 'Tuesday';
		case 'Wed':
			return 'Wednesday';
		case 'Thu':
			return 'Thursday';
		case 'Fri':
			return 'Friday';
		case 'Sat':
			return 'Saturday';
		default:
			return 'Sunday';
	}
};
var _justinmimbs$elm_date_extra$Date_Internal_Format$monthName = function (m) {
	var _p4 = m;
	switch (_p4.ctor) {
		case 'Jan':
			return 'January';
		case 'Feb':
			return 'February';
		case 'Mar':
			return 'March';
		case 'Apr':
			return 'April';
		case 'May':
			return 'May';
		case 'Jun':
			return 'June';
		case 'Jul':
			return 'July';
		case 'Aug':
			return 'August';
		case 'Sep':
			return 'September';
		case 'Oct':
			return 'October';
		case 'Nov':
			return 'November';
		default:
			return 'December';
	}
};
var _justinmimbs$elm_date_extra$Date_Internal_Format$PM = {ctor: 'PM'};
var _justinmimbs$elm_date_extra$Date_Internal_Format$Noon = {ctor: 'Noon'};
var _justinmimbs$elm_date_extra$Date_Internal_Format$AM = {ctor: 'AM'};
var _justinmimbs$elm_date_extra$Date_Internal_Format$Midnight = {ctor: 'Midnight'};
var _justinmimbs$elm_date_extra$Date_Internal_Format$dayPeriod = function (date) {
	var onTheHour = _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Date$minute(date),
		0) && (_elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Date$second(date),
		0) && _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Date$millisecond(date),
		0));
	var hh = _elm_lang$core$Date$hour(date);
	return (_elm_lang$core$Native_Utils.eq(hh, 0) && onTheHour) ? _justinmimbs$elm_date_extra$Date_Internal_Format$Midnight : ((_elm_lang$core$Native_Utils.cmp(hh, 12) < 0) ? _justinmimbs$elm_date_extra$Date_Internal_Format$AM : ((_elm_lang$core$Native_Utils.eq(hh, 12) && onTheHour) ? _justinmimbs$elm_date_extra$Date_Internal_Format$Noon : _justinmimbs$elm_date_extra$Date_Internal_Format$PM));
};
var _justinmimbs$elm_date_extra$Date_Internal_Format$format = F3(
	function (asUtc, date, match) {
		format:
		while (true) {
			var length = _elm_lang$core$String$length(match);
			var $char = A2(_elm_lang$core$String$left, 1, match);
			var _p5 = $char;
			switch (_p5) {
				case 'y':
					var _p6 = length;
					if (_p6 === 2) {
						return A2(
							_elm_lang$core$String$right,
							2,
							A3(
								_elm_lang$core$String$padLeft,
								length,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_elm_lang$core$Date$year(date))));
					} else {
						return A3(
							_elm_lang$core$String$padLeft,
							length,
							_elm_lang$core$Native_Utils.chr('0'),
							_elm_lang$core$Basics$toString(
								_elm_lang$core$Date$year(date)));
					}
				case 'Y':
					var _p7 = length;
					if (_p7 === 2) {
						return A2(
							_elm_lang$core$String$right,
							2,
							A3(
								_elm_lang$core$String$padLeft,
								length,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_justinmimbs$elm_date_extra$Date_Internal_Extract$weekYear(date))));
					} else {
						return A3(
							_elm_lang$core$String$padLeft,
							length,
							_elm_lang$core$Native_Utils.chr('0'),
							_elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$weekYear(date)));
					}
				case 'Q':
					var _p8 = length;
					switch (_p8) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$quarter(date));
						case 2:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$quarter(date));
						case 3:
							return A2(
								F2(
									function (x, y) {
										return A2(_elm_lang$core$Basics_ops['++'], x, y);
									}),
								'Q',
								_elm_lang$core$Basics$toString(
									_justinmimbs$elm_date_extra$Date_Internal_Extract$quarter(date)));
						case 4:
							return _justinmimbs$elm_date_extra$Date_Internal_Format$withOrdinalSuffix(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$quarter(date));
						case 5:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$quarter(date));
						default:
							return '';
					}
				case 'M':
					var _p9 = length;
					switch (_p9) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$monthNumber(date));
						case 2:
							return A3(
								_elm_lang$core$String$padLeft,
								2,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_justinmimbs$elm_date_extra$Date_Internal_Extract$monthNumber(date)));
						case 3:
							return A2(
								_elm_lang$core$String$left,
								3,
								_justinmimbs$elm_date_extra$Date_Internal_Format$monthName(
									_elm_lang$core$Date$month(date)));
						case 4:
							return _justinmimbs$elm_date_extra$Date_Internal_Format$monthName(
								_elm_lang$core$Date$month(date));
						case 5:
							return A2(
								_elm_lang$core$String$left,
								1,
								_justinmimbs$elm_date_extra$Date_Internal_Format$monthName(
									_elm_lang$core$Date$month(date)));
						default:
							return '';
					}
				case 'w':
					var _p10 = length;
					switch (_p10) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$weekNumber(date));
						case 2:
							return A3(
								_elm_lang$core$String$padLeft,
								2,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_justinmimbs$elm_date_extra$Date_Internal_Extract$weekNumber(date)));
						default:
							return '';
					}
				case 'd':
					var _p11 = length;
					switch (_p11) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_elm_lang$core$Date$day(date));
						case 2:
							return A3(
								_elm_lang$core$String$padLeft,
								2,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_elm_lang$core$Date$day(date)));
						case 3:
							return _justinmimbs$elm_date_extra$Date_Internal_Format$withOrdinalSuffix(
								_elm_lang$core$Date$day(date));
						default:
							return '';
					}
				case 'D':
					var _p12 = length;
					switch (_p12) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$ordinalDay(date));
						case 2:
							return A3(
								_elm_lang$core$String$padLeft,
								2,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_justinmimbs$elm_date_extra$Date_Internal_Extract$ordinalDay(date)));
						case 3:
							return A3(
								_elm_lang$core$String$padLeft,
								3,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_justinmimbs$elm_date_extra$Date_Internal_Extract$ordinalDay(date)));
						default:
							return '';
					}
				case 'E':
					var _p13 = _justinmimbs$elm_date_extra$Date_Internal_Format$nameForm(length);
					switch (_p13) {
						case 'abbreviated':
							return A2(
								_elm_lang$core$String$left,
								3,
								_justinmimbs$elm_date_extra$Date_Internal_Format$dayOfWeekName(
									_elm_lang$core$Date$dayOfWeek(date)));
						case 'full':
							return _justinmimbs$elm_date_extra$Date_Internal_Format$dayOfWeekName(
								_elm_lang$core$Date$dayOfWeek(date));
						case 'narrow':
							return A2(
								_elm_lang$core$String$left,
								1,
								_justinmimbs$elm_date_extra$Date_Internal_Format$dayOfWeekName(
									_elm_lang$core$Date$dayOfWeek(date)));
						case 'short':
							return A2(
								_elm_lang$core$String$left,
								2,
								_justinmimbs$elm_date_extra$Date_Internal_Format$dayOfWeekName(
									_elm_lang$core$Date$dayOfWeek(date)));
						default:
							return '';
					}
				case 'e':
					var _p14 = length;
					switch (_p14) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$weekdayNumber(date));
						case 2:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$weekdayNumber(date));
						default:
							var _v15 = asUtc,
								_v16 = date,
								_v17 = _elm_lang$core$String$toUpper(match);
							asUtc = _v15;
							date = _v16;
							match = _v17;
							continue format;
					}
				case 'a':
					var p = _justinmimbs$elm_date_extra$Date_Internal_Format$dayPeriod(date);
					var m = (_elm_lang$core$Native_Utils.eq(p, _justinmimbs$elm_date_extra$Date_Internal_Format$Midnight) || _elm_lang$core$Native_Utils.eq(p, _justinmimbs$elm_date_extra$Date_Internal_Format$AM)) ? 'A' : 'P';
					var _p15 = _justinmimbs$elm_date_extra$Date_Internal_Format$nameForm(length);
					switch (_p15) {
						case 'abbreviated':
							return A2(_elm_lang$core$Basics_ops['++'], m, 'M');
						case 'full':
							return A2(_elm_lang$core$Basics_ops['++'], m, '.M.');
						case 'narrow':
							return m;
						default:
							return '';
					}
				case 'b':
					var _p16 = _justinmimbs$elm_date_extra$Date_Internal_Format$nameForm(length);
					switch (_p16) {
						case 'abbreviated':
							var _p17 = _justinmimbs$elm_date_extra$Date_Internal_Format$dayPeriod(date);
							switch (_p17.ctor) {
								case 'Midnight':
									return 'mid.';
								case 'AM':
									return 'am';
								case 'Noon':
									return 'noon';
								default:
									return 'pm';
							}
						case 'full':
							var _p18 = _justinmimbs$elm_date_extra$Date_Internal_Format$dayPeriod(date);
							switch (_p18.ctor) {
								case 'Midnight':
									return 'midnight';
								case 'AM':
									return 'a.m.';
								case 'Noon':
									return 'noon';
								default:
									return 'p.m.';
							}
						case 'narrow':
							var _p19 = _justinmimbs$elm_date_extra$Date_Internal_Format$dayPeriod(date);
							switch (_p19.ctor) {
								case 'Midnight':
									return 'md';
								case 'AM':
									return 'a';
								case 'Noon':
									return 'nn';
								default:
									return 'p';
							}
						default:
							return '';
					}
				case 'h':
					var _p20 = length;
					switch (_p20) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Format$hour12(date));
						case 2:
							return A3(
								_elm_lang$core$String$padLeft,
								2,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_justinmimbs$elm_date_extra$Date_Internal_Format$hour12(date)));
						default:
							return '';
					}
				case 'H':
					var _p21 = length;
					switch (_p21) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_elm_lang$core$Date$hour(date));
						case 2:
							return A3(
								_elm_lang$core$String$padLeft,
								2,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_elm_lang$core$Date$hour(date)));
						default:
							return '';
					}
				case 'm':
					var _p22 = length;
					switch (_p22) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_elm_lang$core$Date$minute(date));
						case 2:
							return A3(
								_elm_lang$core$String$padLeft,
								2,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_elm_lang$core$Date$minute(date)));
						default:
							return '';
					}
				case 's':
					var _p23 = length;
					switch (_p23) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_elm_lang$core$Date$second(date));
						case 2:
							return A3(
								_elm_lang$core$String$padLeft,
								2,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_elm_lang$core$Date$second(date)));
						default:
							return '';
					}
				case 'S':
					return A3(
						_elm_lang$core$String$padRight,
						length,
						_elm_lang$core$Native_Utils.chr('0'),
						A2(
							_elm_lang$core$String$left,
							length,
							A3(
								_elm_lang$core$String$padLeft,
								3,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_elm_lang$core$Date$millisecond(date)))));
				case 'X':
					if ((_elm_lang$core$Native_Utils.cmp(length, 4) < 0) && (asUtc || _elm_lang$core$Native_Utils.eq(
						_justinmimbs$elm_date_extra$Date_Internal_Extract$offsetFromUtc(date),
						0))) {
						return 'Z';
					} else {
						var _v27 = asUtc,
							_v28 = date,
							_v29 = _elm_lang$core$String$toLower(match);
						asUtc = _v27;
						date = _v28;
						match = _v29;
						continue format;
					}
				case 'x':
					var offset = asUtc ? 0 : _justinmimbs$elm_date_extra$Date_Internal_Extract$offsetFromUtc(date);
					var _p24 = length;
					switch (_p24) {
						case 1:
							return A3(_justinmimbs$elm_date_extra$Date_Internal_Format$formatTimeOffset, '', true, offset);
						case 2:
							return A3(_justinmimbs$elm_date_extra$Date_Internal_Format$formatTimeOffset, '', false, offset);
						case 3:
							return A3(_justinmimbs$elm_date_extra$Date_Internal_Format$formatTimeOffset, ':', false, offset);
						default:
							return '';
					}
				case '\'':
					return _elm_lang$core$Native_Utils.eq(match, '\'\'') ? '\'' : A4(
						_elm_lang$core$Regex$replace,
						_elm_lang$core$Regex$All,
						_elm_lang$core$Regex$regex('\'\''),
						function (_p25) {
							return '\'';
						},
						A3(_elm_lang$core$String$slice, 1, -1, match));
				default:
					return '';
			}
		}
	});
var _justinmimbs$elm_date_extra$Date_Internal_Format$toFormattedString = F3(
	function (asUtc, pattern, date) {
		var date_ = asUtc ? _justinmimbs$elm_date_extra$Date_Internal_Format$toUtc(date) : date;
		return A4(
			_elm_lang$core$Regex$replace,
			_elm_lang$core$Regex$All,
			_justinmimbs$elm_date_extra$Date_Internal_Format$patternMatches,
			function (_p26) {
				return A3(
					_justinmimbs$elm_date_extra$Date_Internal_Format$format,
					asUtc,
					date_,
					function (_) {
						return _.match;
					}(_p26));
			},
			pattern);
	});

var _justinmimbs$elm_date_extra$Date_Internal_Parse$isoDateRegex = function () {
	var time = 'T(\\d{2})(?:(\\:)?(\\d{2})(?:\\10(\\d{2}))?)?(\\.\\d+)?(?:(Z)|(?:([+\\-])(\\d{2})(?:\\:?(\\d{2}))?))?';
	var ord = '\\-?(\\d{3})';
	var week = '(\\-)?W(\\d{2})(?:\\5(\\d))?';
	var cal = '(\\-)?(\\d{2})(?:\\2(\\d{2}))?';
	var year = '(\\d{4})';
	return _elm_lang$core$Regex$regex(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'^',
			A2(
				_elm_lang$core$Basics_ops['++'],
				year,
				A2(
					_elm_lang$core$Basics_ops['++'],
					'(?:',
					A2(
						_elm_lang$core$Basics_ops['++'],
						cal,
						A2(
							_elm_lang$core$Basics_ops['++'],
							'|',
							A2(
								_elm_lang$core$Basics_ops['++'],
								week,
								A2(
									_elm_lang$core$Basics_ops['++'],
									'|',
									A2(
										_elm_lang$core$Basics_ops['++'],
										ord,
										A2(
											_elm_lang$core$Basics_ops['++'],
											')?',
											A2(
												_elm_lang$core$Basics_ops['++'],
												'(?:',
												A2(_elm_lang$core$Basics_ops['++'], time, ')?$'))))))))))));
}();
var _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToFloat = function (_p0) {
	return _elm_lang$core$Result$toMaybe(
		_elm_lang$core$String$toFloat(_p0));
};
var _justinmimbs$elm_date_extra$Date_Internal_Parse$msFromMatches = F4(
	function (timeHH, timeMM, timeSS, timeF) {
		var fractional = A2(
			_elm_lang$core$Maybe$withDefault,
			0.0,
			A2(_elm_lang$core$Maybe$andThen, _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToFloat, timeF));
		var _p1 = function () {
			var _p2 = A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Maybe$andThen(_justinmimbs$elm_date_extra$Date_Internal_Parse$stringToFloat),
				{
					ctor: '::',
					_0: timeHH,
					_1: {
						ctor: '::',
						_0: timeMM,
						_1: {
							ctor: '::',
							_0: timeSS,
							_1: {ctor: '[]'}
						}
					}
				});
			_v0_3:
			do {
				if (((_p2.ctor === '::') && (_p2._0.ctor === 'Just')) && (_p2._1.ctor === '::')) {
					if (_p2._1._0.ctor === 'Just') {
						if (_p2._1._1.ctor === '::') {
							if (_p2._1._1._0.ctor === 'Just') {
								if (_p2._1._1._1.ctor === '[]') {
									return {ctor: '_Tuple3', _0: _p2._0._0, _1: _p2._1._0._0, _2: _p2._1._1._0._0 + fractional};
								} else {
									break _v0_3;
								}
							} else {
								if (_p2._1._1._1.ctor === '[]') {
									return {ctor: '_Tuple3', _0: _p2._0._0, _1: _p2._1._0._0 + fractional, _2: 0.0};
								} else {
									break _v0_3;
								}
							}
						} else {
							break _v0_3;
						}
					} else {
						if (((_p2._1._1.ctor === '::') && (_p2._1._1._0.ctor === 'Nothing')) && (_p2._1._1._1.ctor === '[]')) {
							return {ctor: '_Tuple3', _0: _p2._0._0 + fractional, _1: 0.0, _2: 0.0};
						} else {
							break _v0_3;
						}
					}
				} else {
					break _v0_3;
				}
			} while(false);
			return {ctor: '_Tuple3', _0: 0.0, _1: 0.0, _2: 0.0};
		}();
		var hh = _p1._0;
		var mm = _p1._1;
		var ss = _p1._2;
		return _elm_lang$core$Basics$round(
			((hh * _elm_lang$core$Basics$toFloat(_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerHour)) + (mm * _elm_lang$core$Basics$toFloat(_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute))) + (ss * _elm_lang$core$Basics$toFloat(_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerSecond)));
	});
var _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt = function (_p3) {
	return _elm_lang$core$Result$toMaybe(
		_elm_lang$core$String$toInt(_p3));
};
var _justinmimbs$elm_date_extra$Date_Internal_Parse$unixTimeFromMatches = F6(
	function (yyyy, calMM, calDD, weekWW, weekD, ordDDD) {
		var y = A2(
			_elm_lang$core$Maybe$withDefault,
			1,
			_justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt(yyyy));
		var _p4 = {ctor: '_Tuple2', _0: calMM, _1: weekWW};
		_v1_2:
		do {
			if (_p4.ctor === '_Tuple2') {
				if (_p4._0.ctor === 'Just') {
					if (_p4._1.ctor === 'Nothing') {
						return A3(
							_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromCalendarDate,
							y,
							_justinmimbs$elm_date_extra$Date_Extra_Facts$monthFromMonthNumber(
								A2(
									_elm_lang$core$Maybe$withDefault,
									1,
									A2(_elm_lang$core$Maybe$andThen, _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt, calMM))),
							A2(
								_elm_lang$core$Maybe$withDefault,
								1,
								A2(_elm_lang$core$Maybe$andThen, _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt, calDD)));
					} else {
						break _v1_2;
					}
				} else {
					if (_p4._1.ctor === 'Just') {
						return A3(
							_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromWeekDate,
							y,
							A2(
								_elm_lang$core$Maybe$withDefault,
								1,
								A2(_elm_lang$core$Maybe$andThen, _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt, weekWW)),
							A2(
								_elm_lang$core$Maybe$withDefault,
								1,
								A2(_elm_lang$core$Maybe$andThen, _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt, weekD)));
					} else {
						break _v1_2;
					}
				}
			} else {
				break _v1_2;
			}
		} while(false);
		return A2(
			_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromOrdinalDate,
			y,
			A2(
				_elm_lang$core$Maybe$withDefault,
				1,
				A2(_elm_lang$core$Maybe$andThen, _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt, ordDDD)));
	});
var _justinmimbs$elm_date_extra$Date_Internal_Parse$offsetFromMatches = F4(
	function (tzZ, tzSign, tzHH, tzMM) {
		var _p5 = {ctor: '_Tuple2', _0: tzZ, _1: tzSign};
		_v2_2:
		do {
			if (_p5.ctor === '_Tuple2') {
				if (_p5._0.ctor === 'Just') {
					if ((_p5._0._0 === 'Z') && (_p5._1.ctor === 'Nothing')) {
						return _elm_lang$core$Maybe$Just(0);
					} else {
						break _v2_2;
					}
				} else {
					if (_p5._1.ctor === 'Just') {
						var mm = A2(
							_elm_lang$core$Maybe$withDefault,
							0,
							A2(_elm_lang$core$Maybe$andThen, _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt, tzMM));
						var hh = A2(
							_elm_lang$core$Maybe$withDefault,
							0,
							A2(_elm_lang$core$Maybe$andThen, _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt, tzHH));
						return _elm_lang$core$Maybe$Just(
							(_elm_lang$core$Native_Utils.eq(_p5._1._0, '+') ? 1 : -1) * ((hh * 60) + mm));
					} else {
						break _v2_2;
					}
				}
			} else {
				break _v2_2;
			}
		} while(false);
		return _elm_lang$core$Maybe$Nothing;
	});
var _justinmimbs$elm_date_extra$Date_Internal_Parse$offsetTimeFromMatches = function (matches) {
	var _p6 = matches;
	if (((((((((((((((((((_p6.ctor === '::') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === '::')) && (_p6._1._1.ctor === '::')) && (_p6._1._1._1.ctor === '::')) && (_p6._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1.ctor === '[]')) {
		var offset = A4(_justinmimbs$elm_date_extra$Date_Internal_Parse$offsetFromMatches, _p6._1._1._1._1._1._1._1._1._1._1._1._1._1._0, _p6._1._1._1._1._1._1._1._1._1._1._1._1._1._1._0, _p6._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1._0, _p6._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1._0);
		var timeMS = A4(_justinmimbs$elm_date_extra$Date_Internal_Parse$msFromMatches, _p6._1._1._1._1._1._1._1._1._0, _p6._1._1._1._1._1._1._1._1._1._1._0, _p6._1._1._1._1._1._1._1._1._1._1._1._0, _p6._1._1._1._1._1._1._1._1._1._1._1._1._0);
		var dateMS = A6(_justinmimbs$elm_date_extra$Date_Internal_Parse$unixTimeFromMatches, _p6._0._0, _p6._1._1._0, _p6._1._1._1._0, _p6._1._1._1._1._1._0, _p6._1._1._1._1._1._1._0, _p6._1._1._1._1._1._1._1._0);
		return _elm_lang$core$Maybe$Just(
			{ctor: '_Tuple2', _0: offset, _1: dateMS + timeMS});
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _justinmimbs$elm_date_extra$Date_Internal_Parse$offsetTimeFromIsoString = function (s) {
	return A2(
		_elm_lang$core$Maybe$andThen,
		_justinmimbs$elm_date_extra$Date_Internal_Parse$offsetTimeFromMatches,
		A2(
			_elm_lang$core$Maybe$map,
			function (_) {
				return _.submatches;
			},
			_elm_lang$core$List$head(
				A3(
					_elm_lang$core$Regex$find,
					_elm_lang$core$Regex$AtMost(1),
					_justinmimbs$elm_date_extra$Date_Internal_Parse$isoDateRegex,
					s))));
};

var _justinmimbs$elm_date_extra$Date_Extra$toRataDie = function (date) {
	return A3(
		_justinmimbs$elm_date_extra$Date_Internal_RataDie$fromCalendarDate,
		_elm_lang$core$Date$year(date),
		_elm_lang$core$Date$month(date),
		_elm_lang$core$Date$day(date));
};
var _justinmimbs$elm_date_extra$Date_Extra$toParts = function (date) {
	return {
		ctor: '_Tuple7',
		_0: _elm_lang$core$Date$year(date),
		_1: _elm_lang$core$Date$month(date),
		_2: _elm_lang$core$Date$day(date),
		_3: _elm_lang$core$Date$hour(date),
		_4: _elm_lang$core$Date$minute(date),
		_5: _elm_lang$core$Date$second(date),
		_6: _elm_lang$core$Date$millisecond(date)
	};
};
var _justinmimbs$elm_date_extra$Date_Extra$monthFromQuarter = function (q) {
	var _p0 = q;
	switch (_p0) {
		case 1:
			return _elm_lang$core$Date$Jan;
		case 2:
			return _elm_lang$core$Date$Apr;
		case 3:
			return _elm_lang$core$Date$Jul;
		default:
			return _elm_lang$core$Date$Oct;
	}
};
var _justinmimbs$elm_date_extra$Date_Extra$clamp = F3(
	function (min, max, date) {
		return (_elm_lang$core$Native_Utils.cmp(
			_elm_lang$core$Date$toTime(date),
			_elm_lang$core$Date$toTime(min)) < 0) ? min : ((_elm_lang$core$Native_Utils.cmp(
			_elm_lang$core$Date$toTime(date),
			_elm_lang$core$Date$toTime(max)) > 0) ? max : date);
	});
var _justinmimbs$elm_date_extra$Date_Extra$comparableIsBetween = F3(
	function (a, b, x) {
		return ((_elm_lang$core$Native_Utils.cmp(a, x) < 1) && (_elm_lang$core$Native_Utils.cmp(x, b) < 1)) || ((_elm_lang$core$Native_Utils.cmp(b, x) < 1) && (_elm_lang$core$Native_Utils.cmp(x, a) < 1));
	});
var _justinmimbs$elm_date_extra$Date_Extra$isBetween = F3(
	function (date1, date2, date) {
		return A3(
			_justinmimbs$elm_date_extra$Date_Extra$comparableIsBetween,
			_elm_lang$core$Date$toTime(date1),
			_elm_lang$core$Date$toTime(date2),
			_elm_lang$core$Date$toTime(date));
	});
var _justinmimbs$elm_date_extra$Date_Extra$compare = F2(
	function (a, b) {
		return A2(
			_elm_lang$core$Basics$compare,
			_elm_lang$core$Date$toTime(a),
			_elm_lang$core$Date$toTime(b));
	});
var _justinmimbs$elm_date_extra$Date_Extra$equal = F2(
	function (a, b) {
		return _elm_lang$core$Native_Utils.eq(
			_elm_lang$core$Date$toTime(a),
			_elm_lang$core$Date$toTime(b));
	});
var _justinmimbs$elm_date_extra$Date_Extra$offsetFromUtc = _justinmimbs$elm_date_extra$Date_Internal_Extract$offsetFromUtc;
var _justinmimbs$elm_date_extra$Date_Extra$weekYear = _justinmimbs$elm_date_extra$Date_Internal_Extract$weekYear;
var _justinmimbs$elm_date_extra$Date_Extra$weekNumber = _justinmimbs$elm_date_extra$Date_Internal_Extract$weekNumber;
var _justinmimbs$elm_date_extra$Date_Extra$weekdayNumber = _justinmimbs$elm_date_extra$Date_Internal_Extract$weekdayNumber;
var _justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek = F2(
	function (d, date) {
		return _elm_lang$core$Basics$negate(
			A2(
				_elm_lang$core$Basics_ops['%'],
				(_justinmimbs$elm_date_extra$Date_Extra$weekdayNumber(date) - _justinmimbs$elm_date_extra$Date_Extra_Facts$weekdayNumberFromDayOfWeek(d)) + 7,
				7));
	});
var _justinmimbs$elm_date_extra$Date_Extra$fractionalDay = _justinmimbs$elm_date_extra$Date_Internal_Extract$fractionalDay;
var _justinmimbs$elm_date_extra$Date_Extra$ordinalDay = _justinmimbs$elm_date_extra$Date_Internal_Extract$ordinalDay;
var _justinmimbs$elm_date_extra$Date_Extra$quarter = _justinmimbs$elm_date_extra$Date_Internal_Extract$quarter;
var _justinmimbs$elm_date_extra$Date_Extra$monthNumber = _justinmimbs$elm_date_extra$Date_Internal_Extract$monthNumber;
var _justinmimbs$elm_date_extra$Date_Extra$ordinalMonth = function (date) {
	return (_elm_lang$core$Date$year(date) * 12) + _justinmimbs$elm_date_extra$Date_Extra$monthNumber(date);
};
var _justinmimbs$elm_date_extra$Date_Extra$diffMonth = F2(
	function (date1, date2) {
		var fractionalMonth = function (date) {
			return (_elm_lang$core$Basics$toFloat(
				_elm_lang$core$Date$day(date) - 1) + _justinmimbs$elm_date_extra$Date_Extra$fractionalDay(date)) / 31;
		};
		var ordinalMonthFloat = function (date) {
			return _elm_lang$core$Basics$toFloat(
				_justinmimbs$elm_date_extra$Date_Extra$ordinalMonth(date)) + fractionalMonth(date);
		};
		return _elm_lang$core$Basics$truncate(
			ordinalMonthFloat(date2) - ordinalMonthFloat(date1));
	});
var _justinmimbs$elm_date_extra$Date_Extra$toUtcFormattedString = _justinmimbs$elm_date_extra$Date_Internal_Format$toFormattedString(true);
var _justinmimbs$elm_date_extra$Date_Extra$toUtcIsoString = _justinmimbs$elm_date_extra$Date_Extra$toUtcFormattedString('yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX');
var _justinmimbs$elm_date_extra$Date_Extra$toFormattedString = _justinmimbs$elm_date_extra$Date_Internal_Format$toFormattedString(false);
var _justinmimbs$elm_date_extra$Date_Extra$toIsoString = _justinmimbs$elm_date_extra$Date_Extra$toFormattedString('yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx');
var _justinmimbs$elm_date_extra$Date_Extra$fromTime = function (_p1) {
	return _elm_lang$core$Date$fromTime(
		_elm_lang$core$Basics$toFloat(_p1));
};
var _justinmimbs$elm_date_extra$Date_Extra$fromOffsetTime = function (_p2) {
	var _p3 = _p2;
	var _p5 = _p3._1;
	var _p4 = _p3._0;
	if (_p4.ctor === 'Just') {
		return _justinmimbs$elm_date_extra$Date_Extra$fromTime(_p5 - (_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute * _p4._0));
	} else {
		var offset0 = _justinmimbs$elm_date_extra$Date_Extra$offsetFromUtc(
			_justinmimbs$elm_date_extra$Date_Extra$fromTime(_p5));
		var date1 = _justinmimbs$elm_date_extra$Date_Extra$fromTime(_p5 - (_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute * offset0));
		var offset1 = _justinmimbs$elm_date_extra$Date_Extra$offsetFromUtc(date1);
		if (_elm_lang$core$Native_Utils.eq(offset0, offset1)) {
			return date1;
		} else {
			var date2 = _justinmimbs$elm_date_extra$Date_Extra$fromTime(_p5 - (_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute * offset1));
			var offset2 = _justinmimbs$elm_date_extra$Date_Extra$offsetFromUtc(date2);
			return _elm_lang$core$Native_Utils.eq(offset1, offset2) ? date2 : date1;
		}
	}
};
var _justinmimbs$elm_date_extra$Date_Extra$fromParts = F7(
	function (y, m, d, hh, mm, ss, ms) {
		return _justinmimbs$elm_date_extra$Date_Extra$fromOffsetTime(
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Nothing,
				_1: A7(_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromParts, y, m, d, hh, mm, ss, ms)
			});
	});
var _justinmimbs$elm_date_extra$Date_Extra$addMonths = F2(
	function (n, date) {
		var om = (_justinmimbs$elm_date_extra$Date_Extra$ordinalMonth(date) + n) + -1;
		var y_ = (om / 12) | 0;
		var m_ = _justinmimbs$elm_date_extra$Date_Extra_Facts$monthFromMonthNumber(
			A2(_elm_lang$core$Basics_ops['%'], om, 12) + 1);
		var _p6 = _justinmimbs$elm_date_extra$Date_Extra$toParts(date);
		var y = _p6._0;
		var m = _p6._1;
		var d = _p6._2;
		var hh = _p6._3;
		var mm = _p6._4;
		var ss = _p6._5;
		var ms = _p6._6;
		var d_ = A2(
			_elm_lang$core$Basics$min,
			d,
			A2(_justinmimbs$elm_date_extra$Date_Extra_Facts$daysInMonth, y_, m_));
		return A7(_justinmimbs$elm_date_extra$Date_Extra$fromParts, y_, m_, d_, hh, mm, ss, ms);
	});
var _justinmimbs$elm_date_extra$Date_Extra$add = F3(
	function (interval, n, date) {
		var _p7 = _justinmimbs$elm_date_extra$Date_Extra$toParts(date);
		var y = _p7._0;
		var m = _p7._1;
		var d = _p7._2;
		var hh = _p7._3;
		var mm = _p7._4;
		var ss = _p7._5;
		var ms = _p7._6;
		var _p8 = interval;
		switch (_p8.ctor) {
			case 'Millisecond':
				return _elm_lang$core$Date$fromTime(
					_elm_lang$core$Date$toTime(date) + _elm_lang$core$Basics$toFloat(n));
			case 'Second':
				return _elm_lang$core$Date$fromTime(
					_elm_lang$core$Date$toTime(date) + _elm_lang$core$Basics$toFloat(n * _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerSecond));
			case 'Minute':
				return _elm_lang$core$Date$fromTime(
					_elm_lang$core$Date$toTime(date) + _elm_lang$core$Basics$toFloat(n * _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute));
			case 'Hour':
				return _elm_lang$core$Date$fromTime(
					_elm_lang$core$Date$toTime(date) + _elm_lang$core$Basics$toFloat(n * _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerHour));
			case 'Day':
				return A7(_justinmimbs$elm_date_extra$Date_Extra$fromParts, y, m, d + n, hh, mm, ss, ms);
			case 'Month':
				return A2(_justinmimbs$elm_date_extra$Date_Extra$addMonths, n, date);
			case 'Year':
				return A2(_justinmimbs$elm_date_extra$Date_Extra$addMonths, n * 12, date);
			case 'Quarter':
				return A2(_justinmimbs$elm_date_extra$Date_Extra$addMonths, n * 3, date);
			case 'Week':
				return A7(_justinmimbs$elm_date_extra$Date_Extra$fromParts, y, m, d + (n * 7), hh, mm, ss, ms);
			default:
				return A7(_justinmimbs$elm_date_extra$Date_Extra$fromParts, y, m, d + (n * 7), hh, mm, ss, ms);
		}
	});
var _justinmimbs$elm_date_extra$Date_Extra$rangeHelp = F5(
	function (interval, step, end, revList, date) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(
				_elm_lang$core$Date$toTime(date),
				_elm_lang$core$Date$toTime(end)) < 0) {
				var _v4 = interval,
					_v5 = step,
					_v6 = end,
					_v7 = {ctor: '::', _0: date, _1: revList},
					_v8 = A3(_justinmimbs$elm_date_extra$Date_Extra$add, interval, step, date);
				interval = _v4;
				step = _v5;
				end = _v6;
				revList = _v7;
				date = _v8;
				continue rangeHelp;
			} else {
				return _elm_lang$core$List$reverse(revList);
			}
		}
	});
var _justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate = F3(
	function (y, m, d) {
		return _justinmimbs$elm_date_extra$Date_Extra$fromOffsetTime(
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Nothing,
				_1: A3(_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromCalendarDate, y, m, d)
			});
	});
var _justinmimbs$elm_date_extra$Date_Extra$floor = F2(
	function (interval, date) {
		var _p9 = _justinmimbs$elm_date_extra$Date_Extra$toParts(date);
		var y = _p9._0;
		var m = _p9._1;
		var d = _p9._2;
		var hh = _p9._3;
		var mm = _p9._4;
		var ss = _p9._5;
		var _p10 = interval;
		switch (_p10.ctor) {
			case 'Millisecond':
				return date;
			case 'Second':
				return A7(_justinmimbs$elm_date_extra$Date_Extra$fromParts, y, m, d, hh, mm, ss, 0);
			case 'Minute':
				return A7(_justinmimbs$elm_date_extra$Date_Extra$fromParts, y, m, d, hh, mm, 0, 0);
			case 'Hour':
				return A7(_justinmimbs$elm_date_extra$Date_Extra$fromParts, y, m, d, hh, 0, 0, 0);
			case 'Day':
				return A3(_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate, y, m, d);
			case 'Month':
				return A3(_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate, y, m, 1);
			case 'Year':
				return A3(_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate, y, _elm_lang$core$Date$Jan, 1);
			case 'Quarter':
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					_justinmimbs$elm_date_extra$Date_Extra$monthFromQuarter(
						_justinmimbs$elm_date_extra$Date_Extra$quarter(date)),
					1);
			case 'Week':
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					m,
					d + A2(_justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek, _elm_lang$core$Date$Mon, date));
			case 'Monday':
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					m,
					d + A2(_justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek, _elm_lang$core$Date$Mon, date));
			case 'Tuesday':
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					m,
					d + A2(_justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek, _elm_lang$core$Date$Tue, date));
			case 'Wednesday':
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					m,
					d + A2(_justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek, _elm_lang$core$Date$Wed, date));
			case 'Thursday':
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					m,
					d + A2(_justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek, _elm_lang$core$Date$Thu, date));
			case 'Friday':
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					m,
					d + A2(_justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek, _elm_lang$core$Date$Fri, date));
			case 'Saturday':
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					m,
					d + A2(_justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek, _elm_lang$core$Date$Sat, date));
			default:
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					m,
					d + A2(_justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek, _elm_lang$core$Date$Sun, date));
		}
	});
var _justinmimbs$elm_date_extra$Date_Extra$ceiling = F2(
	function (interval, date) {
		var floored = A2(_justinmimbs$elm_date_extra$Date_Extra$floor, interval, date);
		return _elm_lang$core$Native_Utils.eq(
			_elm_lang$core$Date$toTime(date),
			_elm_lang$core$Date$toTime(floored)) ? date : A3(_justinmimbs$elm_date_extra$Date_Extra$add, interval, 1, floored);
	});
var _justinmimbs$elm_date_extra$Date_Extra$range = F4(
	function (interval, step, start, end) {
		var first = A2(_justinmimbs$elm_date_extra$Date_Extra$ceiling, interval, start);
		return (_elm_lang$core$Native_Utils.cmp(
			_elm_lang$core$Date$toTime(first),
			_elm_lang$core$Date$toTime(end)) < 0) ? A5(
			_justinmimbs$elm_date_extra$Date_Extra$rangeHelp,
			interval,
			A2(_elm_lang$core$Basics$max, 1, step),
			end,
			{ctor: '[]'},
			first) : {ctor: '[]'};
	});
var _justinmimbs$elm_date_extra$Date_Extra$fromIsoString = function (_p11) {
	return A2(
		_elm_lang$core$Maybe$map,
		_justinmimbs$elm_date_extra$Date_Extra$fromOffsetTime,
		_justinmimbs$elm_date_extra$Date_Internal_Parse$offsetTimeFromIsoString(_p11));
};
var _justinmimbs$elm_date_extra$Date_Extra$fromSpec = F3(
	function (_p14, _p13, _p12) {
		var _p15 = _p14;
		var _p16 = _p13;
		var _p17 = _p12;
		return _justinmimbs$elm_date_extra$Date_Extra$fromOffsetTime(
			{ctor: '_Tuple2', _0: _p15._0, _1: _p17._0 + _p16._0});
	});
var _justinmimbs$elm_date_extra$Date_Extra$Offset = function (a) {
	return {ctor: 'Offset', _0: a};
};
var _justinmimbs$elm_date_extra$Date_Extra$utc = _justinmimbs$elm_date_extra$Date_Extra$Offset(
	_elm_lang$core$Maybe$Just(0));
var _justinmimbs$elm_date_extra$Date_Extra$offset = function (minutes) {
	return _justinmimbs$elm_date_extra$Date_Extra$Offset(
		_elm_lang$core$Maybe$Just(minutes));
};
var _justinmimbs$elm_date_extra$Date_Extra$local = _justinmimbs$elm_date_extra$Date_Extra$Offset(_elm_lang$core$Maybe$Nothing);
var _justinmimbs$elm_date_extra$Date_Extra$TimeMS = function (a) {
	return {ctor: 'TimeMS', _0: a};
};
var _justinmimbs$elm_date_extra$Date_Extra$noTime = _justinmimbs$elm_date_extra$Date_Extra$TimeMS(0);
var _justinmimbs$elm_date_extra$Date_Extra$atTime = F4(
	function (hh, mm, ss, ms) {
		return _justinmimbs$elm_date_extra$Date_Extra$TimeMS(
			A4(_justinmimbs$elm_date_extra$Date_Internal_Core$msFromTimeParts, hh, mm, ss, ms));
	});
var _justinmimbs$elm_date_extra$Date_Extra$DateMS = function (a) {
	return {ctor: 'DateMS', _0: a};
};
var _justinmimbs$elm_date_extra$Date_Extra$calendarDate = F3(
	function (y, m, d) {
		return _justinmimbs$elm_date_extra$Date_Extra$DateMS(
			A3(_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromCalendarDate, y, m, d));
	});
var _justinmimbs$elm_date_extra$Date_Extra$ordinalDate = F2(
	function (y, d) {
		return _justinmimbs$elm_date_extra$Date_Extra$DateMS(
			A2(_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromOrdinalDate, y, d));
	});
var _justinmimbs$elm_date_extra$Date_Extra$weekDate = F3(
	function (y, w, d) {
		return _justinmimbs$elm_date_extra$Date_Extra$DateMS(
			A3(_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromWeekDate, y, w, d));
	});
var _justinmimbs$elm_date_extra$Date_Extra$Sunday = {ctor: 'Sunday'};
var _justinmimbs$elm_date_extra$Date_Extra$Saturday = {ctor: 'Saturday'};
var _justinmimbs$elm_date_extra$Date_Extra$Friday = {ctor: 'Friday'};
var _justinmimbs$elm_date_extra$Date_Extra$Thursday = {ctor: 'Thursday'};
var _justinmimbs$elm_date_extra$Date_Extra$Wednesday = {ctor: 'Wednesday'};
var _justinmimbs$elm_date_extra$Date_Extra$Tuesday = {ctor: 'Tuesday'};
var _justinmimbs$elm_date_extra$Date_Extra$Monday = {ctor: 'Monday'};
var _justinmimbs$elm_date_extra$Date_Extra$Week = {ctor: 'Week'};
var _justinmimbs$elm_date_extra$Date_Extra$Quarter = {ctor: 'Quarter'};
var _justinmimbs$elm_date_extra$Date_Extra$Year = {ctor: 'Year'};
var _justinmimbs$elm_date_extra$Date_Extra$Month = {ctor: 'Month'};
var _justinmimbs$elm_date_extra$Date_Extra$Day = {ctor: 'Day'};
var _justinmimbs$elm_date_extra$Date_Extra$diff = F3(
	function (interval, date1, date2) {
		var diffMS = _elm_lang$core$Basics$floor(
			_elm_lang$core$Date$toTime(date2) - _elm_lang$core$Date$toTime(date1));
		var _p18 = interval;
		switch (_p18.ctor) {
			case 'Millisecond':
				return diffMS;
			case 'Second':
				return (diffMS / _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerSecond) | 0;
			case 'Minute':
				return (diffMS / _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute) | 0;
			case 'Hour':
				return (diffMS / _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerHour) | 0;
			case 'Day':
				return (diffMS / _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerDay) | 0;
			case 'Month':
				return A2(_justinmimbs$elm_date_extra$Date_Extra$diffMonth, date1, date2);
			case 'Year':
				return (A2(_justinmimbs$elm_date_extra$Date_Extra$diffMonth, date1, date2) / 12) | 0;
			case 'Quarter':
				return (A2(_justinmimbs$elm_date_extra$Date_Extra$diffMonth, date1, date2) / 3) | 0;
			case 'Week':
				return (A3(_justinmimbs$elm_date_extra$Date_Extra$diff, _justinmimbs$elm_date_extra$Date_Extra$Day, date1, date2) / 7) | 0;
			default:
				var _p19 = _p18;
				return (A3(
					_justinmimbs$elm_date_extra$Date_Extra$diff,
					_justinmimbs$elm_date_extra$Date_Extra$Day,
					A2(_justinmimbs$elm_date_extra$Date_Extra$floor, _p19, date1),
					A2(_justinmimbs$elm_date_extra$Date_Extra$floor, _p19, date2)) / 7) | 0;
		}
	});
var _justinmimbs$elm_date_extra$Date_Extra$fromRataDie = function (rd) {
	return A3(
		_justinmimbs$elm_date_extra$Date_Extra$add,
		_justinmimbs$elm_date_extra$Date_Extra$Day,
		rd - 719163,
		A3(_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate, 1970, _elm_lang$core$Date$Jan, 1));
};
var _justinmimbs$elm_date_extra$Date_Extra$Hour = {ctor: 'Hour'};
var _justinmimbs$elm_date_extra$Date_Extra$Minute = {ctor: 'Minute'};
var _justinmimbs$elm_date_extra$Date_Extra$equalBy = F3(
	function (interval, date1, date2) {
		equalBy:
		while (true) {
			var _p20 = interval;
			switch (_p20.ctor) {
				case 'Millisecond':
					return _elm_lang$core$Native_Utils.eq(
						_elm_lang$core$Date$toTime(date1),
						_elm_lang$core$Date$toTime(date2));
				case 'Second':
					return _elm_lang$core$Native_Utils.eq(
						_elm_lang$core$Date$second(date1),
						_elm_lang$core$Date$second(date2)) && A3(_justinmimbs$elm_date_extra$Date_Extra$equalBy, _justinmimbs$elm_date_extra$Date_Extra$Minute, date1, date2);
				case 'Minute':
					return _elm_lang$core$Native_Utils.eq(
						_elm_lang$core$Date$minute(date1),
						_elm_lang$core$Date$minute(date2)) && A3(_justinmimbs$elm_date_extra$Date_Extra$equalBy, _justinmimbs$elm_date_extra$Date_Extra$Hour, date1, date2);
				case 'Hour':
					return _elm_lang$core$Native_Utils.eq(
						_elm_lang$core$Date$hour(date1),
						_elm_lang$core$Date$hour(date2)) && A3(_justinmimbs$elm_date_extra$Date_Extra$equalBy, _justinmimbs$elm_date_extra$Date_Extra$Day, date1, date2);
				case 'Day':
					return _elm_lang$core$Native_Utils.eq(
						_elm_lang$core$Date$day(date1),
						_elm_lang$core$Date$day(date2)) && A3(_justinmimbs$elm_date_extra$Date_Extra$equalBy, _justinmimbs$elm_date_extra$Date_Extra$Month, date1, date2);
				case 'Month':
					return _elm_lang$core$Native_Utils.eq(
						_elm_lang$core$Date$month(date1),
						_elm_lang$core$Date$month(date2)) && A3(_justinmimbs$elm_date_extra$Date_Extra$equalBy, _justinmimbs$elm_date_extra$Date_Extra$Year, date1, date2);
				case 'Year':
					return _elm_lang$core$Native_Utils.eq(
						_elm_lang$core$Date$year(date1),
						_elm_lang$core$Date$year(date2));
				case 'Quarter':
					return _elm_lang$core$Native_Utils.eq(
						_justinmimbs$elm_date_extra$Date_Extra$quarter(date1),
						_justinmimbs$elm_date_extra$Date_Extra$quarter(date2)) && A3(_justinmimbs$elm_date_extra$Date_Extra$equalBy, _justinmimbs$elm_date_extra$Date_Extra$Year, date1, date2);
				case 'Week':
					return _elm_lang$core$Native_Utils.eq(
						_justinmimbs$elm_date_extra$Date_Extra$weekNumber(date1),
						_justinmimbs$elm_date_extra$Date_Extra$weekNumber(date2)) && _elm_lang$core$Native_Utils.eq(
						_justinmimbs$elm_date_extra$Date_Extra$weekYear(date1),
						_justinmimbs$elm_date_extra$Date_Extra$weekYear(date2));
				default:
					var _p21 = _p20;
					var _v15 = _justinmimbs$elm_date_extra$Date_Extra$Day,
						_v16 = A2(_justinmimbs$elm_date_extra$Date_Extra$floor, _p21, date1),
						_v17 = A2(_justinmimbs$elm_date_extra$Date_Extra$floor, _p21, date2);
					interval = _v15;
					date1 = _v16;
					date2 = _v17;
					continue equalBy;
			}
		}
	});
var _justinmimbs$elm_date_extra$Date_Extra$Second = {ctor: 'Second'};
var _justinmimbs$elm_date_extra$Date_Extra$Millisecond = {ctor: 'Millisecond'};

var _mgold$elm_date_format$Date_Local$brazilian = {
	date: {
		months: {jan: 'Janeiro', feb: 'Fevereiro', mar: 'Março', apr: 'Abril', may: 'Maio', jun: 'Junho', jul: 'Julho', aug: 'Agosto', sep: 'Setembro', oct: 'Outubro', nov: 'Novembro', dec: 'Dezembro'},
		monthsAbbrev: {jan: 'Jan', feb: 'Fev', mar: 'Mar', apr: 'Abr', may: 'Mai', jun: 'Jun', jul: 'Jul', aug: 'Ago', sep: 'Set', oct: 'Out', nov: 'Nov', dec: 'Dez'},
		wdays: {mon: 'Segunda-feira', tue: 'Terça-feira', wed: 'Quarta-feira', thu: 'Quinta-feira', fri: 'Sexta-feira', sat: 'Sábado', sun: 'Domingo'},
		wdaysAbbrev: {mon: 'Seg', tue: 'Ter', wed: 'Qua', thu: 'Qui', fri: 'Sex', sat: 'Sáb', sun: 'Dom'},
		defaultFormat: _elm_lang$core$Maybe$Just('%e de %B de %Y')
	},
	time: {
		am: 'am',
		pm: 'pm',
		defaultFormat: _elm_lang$core$Maybe$Just('%k:%M')
	},
	timeZones: _elm_lang$core$Maybe$Nothing,
	defaultFormat: _elm_lang$core$Maybe$Nothing
};
var _mgold$elm_date_format$Date_Local$french = {
	date: {
		months: {jan: 'Janvier', feb: 'Février', mar: 'Mars', apr: 'Avril', may: 'Mai', jun: 'Juin', jul: 'Juillet', aug: 'Août', sep: 'Septembre', oct: 'Octobre', nov: 'Novembre', dec: 'Décembre'},
		monthsAbbrev: {jan: 'Jan', feb: 'Fév', mar: 'Mar', apr: 'Avr', may: 'Mai', jun: 'Jui', jul: 'Jul', aug: 'Aoû', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Déc'},
		wdays: {mon: 'Lundi', tue: 'Mardi', wed: 'Mercredi', thu: 'Jeudi', fri: 'Vendredi', sat: 'Samedi', sun: 'Dimanche'},
		wdaysAbbrev: {mon: 'Lun', tue: 'Mar', wed: 'Mer', thu: 'Jeu', fri: 'Ven', sat: 'Sam', sun: 'Dim'},
		defaultFormat: _elm_lang$core$Maybe$Nothing
	},
	time: {am: 'am', pm: 'pm', defaultFormat: _elm_lang$core$Maybe$Nothing},
	timeZones: _elm_lang$core$Maybe$Nothing,
	defaultFormat: _elm_lang$core$Maybe$Nothing
};
var _mgold$elm_date_format$Date_Local$international = {
	date: {
		months: {jan: 'January', feb: 'February', mar: 'March', apr: 'April', may: 'May', jun: 'June', jul: 'July', aug: 'August', sep: 'September', oct: 'October', nov: 'November', dec: 'December'},
		monthsAbbrev: {jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun', jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec'},
		wdays: {mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday'},
		wdaysAbbrev: {mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun'},
		defaultFormat: _elm_lang$core$Maybe$Nothing
	},
	time: {am: 'am', pm: 'pm', defaultFormat: _elm_lang$core$Maybe$Nothing},
	timeZones: _elm_lang$core$Maybe$Nothing,
	defaultFormat: _elm_lang$core$Maybe$Nothing
};
var _mgold$elm_date_format$Date_Local$Local = F4(
	function (a, b, c, d) {
		return {date: a, time: b, timeZones: c, defaultFormat: d};
	});
var _mgold$elm_date_format$Date_Local$Months = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return {jan: a, feb: b, mar: c, apr: d, may: e, jun: f, jul: g, aug: h, sep: i, oct: j, nov: k, dec: l};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _mgold$elm_date_format$Date_Local$WeekDays = F7(
	function (a, b, c, d, e, f, g) {
		return {mon: a, tue: b, wed: c, thu: d, fri: e, sat: f, sun: g};
	});

var _mgold$elm_date_format$Date_Format$padWith = function (padding) {
	var padder = function () {
		var _p0 = padding;
		switch (_p0.ctor) {
			case 'NoPadding':
				return _elm_lang$core$Basics$identity;
			case 'Zero':
				return A2(
					_elm_lang$core$String$padLeft,
					2,
					_elm_lang$core$Native_Utils.chr('0'));
			case 'ZeroThreeDigits':
				return A2(
					_elm_lang$core$String$padLeft,
					3,
					_elm_lang$core$Native_Utils.chr('0'));
			default:
				return A2(
					_elm_lang$core$String$padLeft,
					2,
					_elm_lang$core$Native_Utils.chr(' '));
		}
	}();
	return function (_p1) {
		return padder(
			_elm_lang$core$Basics$toString(_p1));
	};
};
var _mgold$elm_date_format$Date_Format$zero2twelve = function (n) {
	return _elm_lang$core$Native_Utils.eq(n, 0) ? 12 : n;
};
var _mgold$elm_date_format$Date_Format$mod12 = function (h) {
	return A2(_elm_lang$core$Basics_ops['%'], h, 12);
};
var _mgold$elm_date_format$Date_Format$dayOfWeekToWord = F2(
	function (loc, dow) {
		var _p2 = dow;
		switch (_p2.ctor) {
			case 'Mon':
				return loc.mon;
			case 'Tue':
				return loc.tue;
			case 'Wed':
				return loc.wed;
			case 'Thu':
				return loc.thu;
			case 'Fri':
				return loc.fri;
			case 'Sat':
				return loc.sat;
			default:
				return loc.sun;
		}
	});
var _mgold$elm_date_format$Date_Format$monthToWord = F2(
	function (loc, m) {
		var _p3 = m;
		switch (_p3.ctor) {
			case 'Jan':
				return loc.jan;
			case 'Feb':
				return loc.feb;
			case 'Mar':
				return loc.mar;
			case 'Apr':
				return loc.apr;
			case 'May':
				return loc.may;
			case 'Jun':
				return loc.jun;
			case 'Jul':
				return loc.jul;
			case 'Aug':
				return loc.aug;
			case 'Sep':
				return loc.sep;
			case 'Oct':
				return loc.oct;
			case 'Nov':
				return loc.nov;
			default:
				return loc.dec;
		}
	});
var _mgold$elm_date_format$Date_Format$monthToInt = function (m) {
	var _p4 = m;
	switch (_p4.ctor) {
		case 'Jan':
			return 1;
		case 'Feb':
			return 2;
		case 'Mar':
			return 3;
		case 'Apr':
			return 4;
		case 'May':
			return 5;
		case 'Jun':
			return 6;
		case 'Jul':
			return 7;
		case 'Aug':
			return 8;
		case 'Sep':
			return 9;
		case 'Oct':
			return 10;
		case 'Nov':
			return 11;
		default:
			return 12;
	}
};
var _mgold$elm_date_format$Date_Format$re = _elm_lang$core$Regex$regex('%(_|-|0)?(%|Y|y|m|B|b|d|e|a|A|H|k|I|l|L|p|P|M|S)');
var _mgold$elm_date_format$Date_Format$ZeroThreeDigits = {ctor: 'ZeroThreeDigits'};
var _mgold$elm_date_format$Date_Format$Zero = {ctor: 'Zero'};
var _mgold$elm_date_format$Date_Format$Space = {ctor: 'Space'};
var _mgold$elm_date_format$Date_Format$NoPadding = {ctor: 'NoPadding'};
var _mgold$elm_date_format$Date_Format$formatToken = F3(
	function (loc, d, m) {
		var _p5 = function () {
			var _p6 = m.submatches;
			_v4_4:
			do {
				if (_p6.ctor === '::') {
					if (_p6._0.ctor === 'Just') {
						if (((_p6._1.ctor === '::') && (_p6._1._0.ctor === 'Just')) && (_p6._1._1.ctor === '[]')) {
							switch (_p6._0._0) {
								case '-':
									return {
										ctor: '_Tuple2',
										_0: _elm_lang$core$Maybe$Just(_mgold$elm_date_format$Date_Format$NoPadding),
										_1: _p6._1._0._0
									};
								case '_':
									return {
										ctor: '_Tuple2',
										_0: _elm_lang$core$Maybe$Just(_mgold$elm_date_format$Date_Format$Space),
										_1: _p6._1._0._0
									};
								case '0':
									return {
										ctor: '_Tuple2',
										_0: _elm_lang$core$Maybe$Just(_mgold$elm_date_format$Date_Format$Zero),
										_1: _p6._1._0._0
									};
								default:
									break _v4_4;
							}
						} else {
							break _v4_4;
						}
					} else {
						if (((_p6._1.ctor === '::') && (_p6._1._0.ctor === 'Just')) && (_p6._1._1.ctor === '[]')) {
							return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _p6._1._0._0};
						} else {
							break _v4_4;
						}
					}
				} else {
					break _v4_4;
				}
			} while(false);
			return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: ' '};
		}();
		var padding = _p5._0;
		var symbol = _p5._1;
		var _p7 = symbol;
		switch (_p7) {
			case '%':
				return '%';
			case 'Y':
				return _elm_lang$core$Basics$toString(
					_elm_lang$core$Date$year(d));
			case 'y':
				return A2(
					_elm_lang$core$String$right,
					2,
					_elm_lang$core$Basics$toString(
						_elm_lang$core$Date$year(d)));
			case 'm':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Zero, padding),
					_mgold$elm_date_format$Date_Format$monthToInt(
						_elm_lang$core$Date$month(d)));
			case 'B':
				return A2(
					_mgold$elm_date_format$Date_Format$monthToWord,
					loc.date.months,
					_elm_lang$core$Date$month(d));
			case 'b':
				return A2(
					_mgold$elm_date_format$Date_Format$monthToWord,
					loc.date.monthsAbbrev,
					_elm_lang$core$Date$month(d));
			case 'd':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Zero, padding),
					_elm_lang$core$Date$day(d));
			case 'e':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Space, padding),
					_elm_lang$core$Date$day(d));
			case 'a':
				return A2(
					_mgold$elm_date_format$Date_Format$dayOfWeekToWord,
					loc.date.wdaysAbbrev,
					_elm_lang$core$Date$dayOfWeek(d));
			case 'A':
				return A2(
					_mgold$elm_date_format$Date_Format$dayOfWeekToWord,
					loc.date.wdays,
					_elm_lang$core$Date$dayOfWeek(d));
			case 'H':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Zero, padding),
					_elm_lang$core$Date$hour(d));
			case 'k':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Space, padding),
					_elm_lang$core$Date$hour(d));
			case 'I':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Zero, padding),
					_mgold$elm_date_format$Date_Format$zero2twelve(
						_mgold$elm_date_format$Date_Format$mod12(
							_elm_lang$core$Date$hour(d))));
			case 'l':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Space, padding),
					_mgold$elm_date_format$Date_Format$zero2twelve(
						_mgold$elm_date_format$Date_Format$mod12(
							_elm_lang$core$Date$hour(d))));
			case 'p':
				return (_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$Date$hour(d),
					12) < 0) ? _elm_lang$core$String$toUpper(loc.time.am) : _elm_lang$core$String$toUpper(loc.time.pm);
			case 'P':
				return (_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$Date$hour(d),
					12) < 0) ? loc.time.am : loc.time.pm;
			case 'M':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Zero, padding),
					_elm_lang$core$Date$minute(d));
			case 'S':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$Zero, padding),
					_elm_lang$core$Date$second(d));
			case 'L':
				return A2(
					_mgold$elm_date_format$Date_Format$padWith,
					A2(_elm_lang$core$Maybe$withDefault, _mgold$elm_date_format$Date_Format$ZeroThreeDigits, padding),
					_elm_lang$core$Date$millisecond(d));
			default:
				return '';
		}
	});
var _mgold$elm_date_format$Date_Format$localFormat = F3(
	function (loc, s, d) {
		return A4(
			_elm_lang$core$Regex$replace,
			_elm_lang$core$Regex$All,
			_mgold$elm_date_format$Date_Format$re,
			A2(_mgold$elm_date_format$Date_Format$formatToken, loc, d),
			s);
	});
var _mgold$elm_date_format$Date_Format$format = F2(
	function (s, d) {
		return A3(_mgold$elm_date_format$Date_Format$localFormat, _mgold$elm_date_format$Date_Local$international, s, d);
	});
var _mgold$elm_date_format$Date_Format$formatISO8601 = _mgold$elm_date_format$Date_Format$format('%Y-%m-%dT%H:%M:%SZ');

var _myrho$elm_round$Round$funNum = F3(
	function (fun, s, fl) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			1 / 0,
			_elm_lang$core$Result$toMaybe(
				_elm_lang$core$String$toFloat(
					A2(fun, s, fl))));
	});
var _myrho$elm_round$Round$splitComma = function (str) {
	var _p0 = A2(_elm_lang$core$String$split, '.', str);
	if (_p0.ctor === '::') {
		if (_p0._1.ctor === '::') {
			return {ctor: '_Tuple2', _0: _p0._0, _1: _p0._1._0};
		} else {
			return {ctor: '_Tuple2', _0: _p0._0, _1: '0'};
		}
	} else {
		return {ctor: '_Tuple2', _0: '0', _1: '0'};
	}
};
var _myrho$elm_round$Round$toDecimal = function (fl) {
	var _p1 = A2(
		_elm_lang$core$String$split,
		'e',
		_elm_lang$core$Basics$toString(fl));
	if (_p1.ctor === '::') {
		if (_p1._1.ctor === '::') {
			var _p4 = _p1._1._0;
			var _p2 = function () {
				var hasSign = _elm_lang$core$Native_Utils.cmp(fl, 0) < 0;
				var _p3 = _myrho$elm_round$Round$splitComma(_p1._0);
				var b = _p3._0;
				var a = _p3._1;
				return {
					ctor: '_Tuple3',
					_0: hasSign ? '-' : '',
					_1: hasSign ? A2(_elm_lang$core$String$dropLeft, 1, b) : b,
					_2: a
				};
			}();
			var sign = _p2._0;
			var before = _p2._1;
			var after = _p2._2;
			var e = A2(
				_elm_lang$core$Maybe$withDefault,
				0,
				_elm_lang$core$Result$toMaybe(
					_elm_lang$core$String$toInt(
						A2(_elm_lang$core$String$startsWith, '+', _p4) ? A2(_elm_lang$core$String$dropLeft, 1, _p4) : _p4)));
			var newBefore = (_elm_lang$core$Native_Utils.cmp(e, 0) > -1) ? before : ((_elm_lang$core$Native_Utils.cmp(
				_elm_lang$core$Basics$abs(e),
				_elm_lang$core$String$length(before)) < 0) ? A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$String$left,
					_elm_lang$core$String$length(before) - _elm_lang$core$Basics$abs(e),
					before),
				A2(
					_elm_lang$core$Basics_ops['++'],
					'.',
					A2(
						_elm_lang$core$String$right,
						_elm_lang$core$Basics$abs(e),
						before))) : A2(
				_elm_lang$core$Basics_ops['++'],
				'0.',
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_elm_lang$core$String$repeat,
						_elm_lang$core$Basics$abs(e) - _elm_lang$core$String$length(before),
						'0'),
					before)));
			var newAfter = (_elm_lang$core$Native_Utils.cmp(e, 0) < 1) ? after : ((_elm_lang$core$Native_Utils.cmp(
				e,
				_elm_lang$core$String$length(after)) < 0) ? A2(
				_elm_lang$core$Basics_ops['++'],
				A2(_elm_lang$core$String$left, e, after),
				A2(
					_elm_lang$core$Basics_ops['++'],
					'.',
					A2(
						_elm_lang$core$String$right,
						_elm_lang$core$String$length(after) - e,
						after))) : A2(
				_elm_lang$core$Basics_ops['++'],
				after,
				A2(
					_elm_lang$core$String$repeat,
					e - _elm_lang$core$String$length(after),
					'0')));
			return A2(
				_elm_lang$core$Basics_ops['++'],
				sign,
				A2(_elm_lang$core$Basics_ops['++'], newBefore, newAfter));
		} else {
			return _p1._0;
		}
	} else {
		return '';
	}
};
var _myrho$elm_round$Round$truncate = function (n) {
	return (_elm_lang$core$Native_Utils.cmp(n, 0) < 0) ? _elm_lang$core$Basics$ceiling(n) : _elm_lang$core$Basics$floor(n);
};
var _myrho$elm_round$Round$roundFun = F3(
	function (functor, s, fl) {
		if (_elm_lang$core$Native_Utils.eq(s, 0)) {
			return _elm_lang$core$Basics$toString(
				functor(fl));
		} else {
			if (_elm_lang$core$Native_Utils.cmp(s, 0) < 0) {
				return function (r) {
					return (!_elm_lang$core$Native_Utils.eq(r, '0')) ? A2(
						_elm_lang$core$Basics_ops['++'],
						r,
						A2(
							_elm_lang$core$String$repeat,
							_elm_lang$core$Basics$abs(s),
							'0')) : r;
				}(
					A3(
						_myrho$elm_round$Round$roundFun,
						functor,
						0,
						A2(
							F2(
								function (x, y) {
									return x / y;
								}),
							fl,
							A2(
								F2(
									function (x, y) {
										return Math.pow(x, y);
									}),
								10,
								_elm_lang$core$Basics$abs(
									_elm_lang$core$Basics$toFloat(s))))));
			} else {
				var dd = (_elm_lang$core$Native_Utils.cmp(fl, 0) < 0) ? 2 : 1;
				var n = (_elm_lang$core$Native_Utils.cmp(fl, 0) < 0) ? -1 : 1;
				var e = Math.pow(10, s);
				var _p5 = _myrho$elm_round$Round$splitComma(
					_myrho$elm_round$Round$toDecimal(fl));
				var before = _p5._0;
				var after = _p5._1;
				var a = A3(
					_elm_lang$core$String$padRight,
					s + 1,
					_elm_lang$core$Native_Utils.chr('0'),
					after);
				var b = A2(_elm_lang$core$String$left, s, a);
				var c = A2(_elm_lang$core$String$dropLeft, s, a);
				var f = functor(
					A2(
						_elm_lang$core$Maybe$withDefault,
						_elm_lang$core$Basics$toFloat(e),
						_elm_lang$core$Result$toMaybe(
							_elm_lang$core$String$toFloat(
								A2(
									_elm_lang$core$Basics_ops['++'],
									(_elm_lang$core$Native_Utils.cmp(fl, 0) < 0) ? '-' : '',
									A2(
										_elm_lang$core$Basics_ops['++'],
										'1',
										A2(
											_elm_lang$core$Basics_ops['++'],
											b,
											A2(_elm_lang$core$Basics_ops['++'], '.', c))))))));
				var g = A2(
					_elm_lang$core$String$dropLeft,
					dd,
					_elm_lang$core$Basics$toString(f));
				var h = _myrho$elm_round$Round$truncate(fl) + (_elm_lang$core$Native_Utils.eq(f - (e * n), e * n) ? ((_elm_lang$core$Native_Utils.cmp(fl, 0) < 0) ? -1 : 1) : 0);
				var j = _elm_lang$core$Basics$toString(h);
				var i = (_elm_lang$core$Native_Utils.eq(j, '0') && ((!_elm_lang$core$Native_Utils.eq(f - (e * n), 0)) && ((_elm_lang$core$Native_Utils.cmp(fl, 0) < 0) && (_elm_lang$core$Native_Utils.cmp(fl, -1) > 0)))) ? A2(_elm_lang$core$Basics_ops['++'], '-', j) : j;
				return A2(
					_elm_lang$core$Basics_ops['++'],
					i,
					A2(_elm_lang$core$Basics_ops['++'], '.', g));
			}
		}
	});
var _myrho$elm_round$Round$round = _myrho$elm_round$Round$roundFun(_elm_lang$core$Basics$round);
var _myrho$elm_round$Round$roundNum = _myrho$elm_round$Round$funNum(_myrho$elm_round$Round$round);
var _myrho$elm_round$Round$ceiling = _myrho$elm_round$Round$roundFun(_elm_lang$core$Basics$ceiling);
var _myrho$elm_round$Round$ceilingNum = _myrho$elm_round$Round$funNum(_myrho$elm_round$Round$ceiling);
var _myrho$elm_round$Round$floor = _myrho$elm_round$Round$roundFun(_elm_lang$core$Basics$floor);
var _myrho$elm_round$Round$floorCom = F2(
	function (s, fl) {
		return (_elm_lang$core$Native_Utils.cmp(fl, 0) < 0) ? A2(_myrho$elm_round$Round$ceiling, s, fl) : A2(_myrho$elm_round$Round$floor, s, fl);
	});
var _myrho$elm_round$Round$floorNumCom = _myrho$elm_round$Round$funNum(_myrho$elm_round$Round$floorCom);
var _myrho$elm_round$Round$ceilingCom = F2(
	function (s, fl) {
		return (_elm_lang$core$Native_Utils.cmp(fl, 0) < 0) ? A2(_myrho$elm_round$Round$floor, s, fl) : A2(_myrho$elm_round$Round$ceiling, s, fl);
	});
var _myrho$elm_round$Round$ceilingNumCom = _myrho$elm_round$Round$funNum(_myrho$elm_round$Round$ceilingCom);
var _myrho$elm_round$Round$floorNum = _myrho$elm_round$Round$funNum(_myrho$elm_round$Round$floor);
var _myrho$elm_round$Round$roundCom = _myrho$elm_round$Round$roundFun(
	function (fl) {
		var dec = fl - _elm_lang$core$Basics$toFloat(
			_myrho$elm_round$Round$truncate(fl));
		return (_elm_lang$core$Native_Utils.cmp(dec, 0.5) > -1) ? _elm_lang$core$Basics$ceiling(fl) : ((_elm_lang$core$Native_Utils.cmp(dec, -0.5) < 1) ? _elm_lang$core$Basics$floor(fl) : _elm_lang$core$Basics$round(fl));
	});
var _myrho$elm_round$Round$roundNumCom = _myrho$elm_round$Round$funNum(_myrho$elm_round$Round$roundCom);

var _user$project$Random_Pipeline$send = _elm_lang$core$Random$generate;
var _user$project$Random_Pipeline$with = _elm_lang$core$Random$map2(
	F2(
		function (x, y) {
			return y(x);
		}));
var _user$project$Random_Pipeline$generate = function (f) {
	return A2(
		_elm_lang$core$Random$map,
		function (_p0) {
			return f;
		},
		_elm_lang$core$Random$bool);
};

var _user$project$Internal_Coordinate$largestRange = F2(
	function (data, range) {
		return {
			min: A2(_elm_lang$core$Basics$min, data.min, range.min),
			max: A2(_elm_lang$core$Basics$max, data.max, range.max)
		};
	});
var _user$project$Internal_Coordinate$smallestRange = F2(
	function (data, range) {
		return {
			min: A2(_elm_lang$core$Basics$max, data.min, range.min),
			max: A2(_elm_lang$core$Basics$min, data.max, range.max)
		};
	});
var _user$project$Internal_Coordinate$lengthY = function (system) {
	return A2(_elm_lang$core$Basics$max, 1, (system.frame.size.height - system.frame.margin.bottom) - system.frame.margin.top);
};
var _user$project$Internal_Coordinate$lengthX = function (system) {
	return A2(_elm_lang$core$Basics$max, 1, (system.frame.size.width - system.frame.margin.left) - system.frame.margin.right);
};
var _user$project$Internal_Coordinate$reachY = function (system) {
	var diff = system.y.max - system.y.min;
	return (_elm_lang$core$Native_Utils.cmp(diff, 0) > 0) ? diff : 1;
};
var _user$project$Internal_Coordinate$reachX = function (system) {
	var diff = system.x.max - system.x.min;
	return (_elm_lang$core$Native_Utils.cmp(diff, 0) > 0) ? diff : 1;
};
var _user$project$Internal_Coordinate$ground = function (range) {
	return _elm_lang$core$Native_Utils.update(
		range,
		{
			min: A2(_elm_lang$core$Basics$min, range.min, 0)
		});
};
var _user$project$Internal_Coordinate$maximum = function (toValue) {
	return function (_p0) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			1,
			_elm_lang$core$List$maximum(
				A2(_elm_lang$core$List$map, toValue, _p0)));
	};
};
var _user$project$Internal_Coordinate$minimum = function (toValue) {
	return function (_p1) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			0,
			_elm_lang$core$List$minimum(
				A2(_elm_lang$core$List$map, toValue, _p1)));
	};
};
var _user$project$Internal_Coordinate$minimumOrZero = function (toValue) {
	return function (_p2) {
		return A2(
			_elm_lang$core$Basics$min,
			0,
			A2(_user$project$Internal_Coordinate$minimum, toValue, _p2));
	};
};
var _user$project$Internal_Coordinate$range = F2(
	function (toValue, data) {
		var range = {
			min: A2(_user$project$Internal_Coordinate$minimum, toValue, data),
			max: A2(_user$project$Internal_Coordinate$maximum, toValue, data)
		};
		return _elm_lang$core$Native_Utils.eq(range.min, range.max) ? _elm_lang$core$Native_Utils.update(
			range,
			{max: range.max + 1}) : range;
	});
var _user$project$Internal_Coordinate$System = F6(
	function (a, b, c, d, e, f) {
		return {frame: a, x: b, y: c, xData: d, yData: e, id: f};
	});
var _user$project$Internal_Coordinate$Frame = F2(
	function (a, b) {
		return {margin: a, size: b};
	});
var _user$project$Internal_Coordinate$Size = F2(
	function (a, b) {
		return {width: a, height: b};
	});
var _user$project$Internal_Coordinate$Margin = F4(
	function (a, b, c, d) {
		return {top: a, right: b, bottom: c, left: d};
	});
var _user$project$Internal_Coordinate$Range = F2(
	function (a, b) {
		return {min: a, max: b};
	});

var _user$project$Internal_Container$sizeStyles = F3(
	function (_p0, width, height) {
		var _p1 = _p0;
		var _p2 = _p1._0.size;
		if (_p2.ctor === 'Static') {
			return {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'height',
					_1: A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(height),
						'px')
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'width',
						_1: A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(width),
							'px')
					},
					_1: {ctor: '[]'}
				}
			};
		} else {
			return {ctor: '[]'};
		}
	});
var _user$project$Internal_Container$properties = F2(
	function (f, _p3) {
		var _p4 = _p3;
		return f(_p4._0);
	});
var _user$project$Internal_Container$Properties = F5(
	function (a, b, c, d, e) {
		return {attributesHtml: a, attributesSvg: b, size: c, margin: d, id: e};
	});
var _user$project$Internal_Container$Margin = F4(
	function (a, b, c, d) {
		return {top: a, right: b, bottom: c, left: d};
	});
var _user$project$Internal_Container$Config = function (a) {
	return {ctor: 'Config', _0: a};
};
var _user$project$Internal_Container$custom = _user$project$Internal_Container$Config;
var _user$project$Internal_Container$Relative = {ctor: 'Relative'};
var _user$project$Internal_Container$relative = _user$project$Internal_Container$Relative;
var _user$project$Internal_Container$responsive = function (id) {
	return _user$project$Internal_Container$custom(
		{
			attributesHtml: {ctor: '[]'},
			attributesSvg: {ctor: '[]'},
			size: _user$project$Internal_Container$relative,
			margin: A4(_user$project$Internal_Container$Margin, 60, 140, 60, 80),
			id: id
		});
};
var _user$project$Internal_Container$Static = {ctor: 'Static'};
var _user$project$Internal_Container$static = _user$project$Internal_Container$Static;
var _user$project$Internal_Container$default = function (id) {
	return _user$project$Internal_Container$custom(
		{
			attributesHtml: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'font-family', _1: 'monospace'},
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			},
			attributesSvg: {ctor: '[]'},
			size: _user$project$Internal_Container$static,
			margin: A4(_user$project$Internal_Container$Margin, 60, 140, 60, 80),
			id: id
		});
};
var _user$project$Internal_Container$spaced = F5(
	function (id, top, right, bottom, left) {
		return _user$project$Internal_Container$custom(
			{
				attributesHtml: {ctor: '[]'},
				attributesSvg: {ctor: '[]'},
				size: _user$project$Internal_Container$static,
				margin: A4(_user$project$Internal_Container$Margin, top, right, bottom, left),
				id: id
			});
	});

var _user$project$LineChart_Container$static = _user$project$Internal_Container$static;
var _user$project$LineChart_Container$relative = _user$project$Internal_Container$relative;
var _user$project$LineChart_Container$custom = _user$project$Internal_Container$custom;
var _user$project$LineChart_Container$responsive = _user$project$Internal_Container$responsive;
var _user$project$LineChart_Container$spaced = _user$project$Internal_Container$spaced;
var _user$project$LineChart_Container$default = _user$project$Internal_Container$default;
var _user$project$LineChart_Container$Properties = F5(
	function (a, b, c, d, e) {
		return {attributesHtml: a, attributesSvg: b, size: c, margin: d, id: e};
	});
var _user$project$LineChart_Container$Margin = F4(
	function (a, b, c, d) {
		return {top: a, right: b, bottom: c, left: d};
	});

var _user$project$LineChart_Coordinate$scaleDataY = F2(
	function (system, value) {
		return (value * _user$project$Internal_Coordinate$reachY(system)) / _user$project$Internal_Coordinate$lengthY(system);
	});
var _user$project$LineChart_Coordinate$scaleDataX = F2(
	function (system, value) {
		return (value * _user$project$Internal_Coordinate$reachX(system)) / _user$project$Internal_Coordinate$lengthX(system);
	});
var _user$project$LineChart_Coordinate$scaleSvgY = F2(
	function (system, value) {
		return (value * _user$project$Internal_Coordinate$lengthY(system)) / _user$project$Internal_Coordinate$reachY(system);
	});
var _user$project$LineChart_Coordinate$scaleSvgX = F2(
	function (system, value) {
		return (value * _user$project$Internal_Coordinate$lengthX(system)) / _user$project$Internal_Coordinate$reachX(system);
	});
var _user$project$LineChart_Coordinate$toDataY = F2(
	function (system, value) {
		return system.y.max - A2(_user$project$LineChart_Coordinate$scaleDataY, system, value - system.frame.margin.top);
	});
var _user$project$LineChart_Coordinate$toDataX = F2(
	function (system, value) {
		return system.x.min + A2(_user$project$LineChart_Coordinate$scaleDataX, system, value - system.frame.margin.left);
	});
var _user$project$LineChart_Coordinate$toData = F2(
	function (system, point) {
		return {
			x: A2(_user$project$LineChart_Coordinate$toDataX, system, point.x),
			y: A2(_user$project$LineChart_Coordinate$toDataY, system, point.y)
		};
	});
var _user$project$LineChart_Coordinate$toSvgY = F2(
	function (system, value) {
		return A2(_user$project$LineChart_Coordinate$scaleSvgY, system, system.y.max - value) + system.frame.margin.top;
	});
var _user$project$LineChart_Coordinate$toSvgX = F2(
	function (system, value) {
		return A2(_user$project$LineChart_Coordinate$scaleSvgX, system, value - system.x.min) + system.frame.margin.left;
	});
var _user$project$LineChart_Coordinate$toSvg = F2(
	function (system, point) {
		return {
			x: A2(_user$project$LineChart_Coordinate$toSvgX, system, point.x),
			y: A2(_user$project$LineChart_Coordinate$toSvgY, system, point.y)
		};
	});
var _user$project$LineChart_Coordinate$Frame = F2(
	function (a, b) {
		return {margin: a, size: b};
	});
var _user$project$LineChart_Coordinate$Size = F2(
	function (a, b) {
		return {width: a, height: b};
	});
var _user$project$LineChart_Coordinate$System = F6(
	function (a, b, c, d, e, f) {
		return {frame: a, x: b, y: c, xData: d, yData: e, id: f};
	});
var _user$project$LineChart_Coordinate$Range = F2(
	function (a, b) {
		return {min: a, max: b};
	});
var _user$project$LineChart_Coordinate$Point = F2(
	function (a, b) {
		return {x: a, y: b};
	});

var _user$project$LineChart_Colors$transparent = A4(_elm_lang$core$Color$rgba, 0, 0, 0, 0);
var _user$project$LineChart_Colors$grayLightest = A3(_elm_lang$core$Color$rgb, 243, 243, 243);
var _user$project$LineChart_Colors$grayLight = A3(_elm_lang$core$Color$rgb, 211, 211, 211);
var _user$project$LineChart_Colors$gray = A3(_elm_lang$core$Color$rgb, 163, 163, 163);
var _user$project$LineChart_Colors$black = A3(_elm_lang$core$Color$rgb, 0, 0, 0);
var _user$project$LineChart_Colors$tealLight = A4(_elm_lang$core$Color$rgba, 128, 203, 196, 1);
var _user$project$LineChart_Colors$teal = A4(_elm_lang$core$Color$rgba, 29, 233, 182, 1);
var _user$project$LineChart_Colors$cyanLight = A4(_elm_lang$core$Color$rgba, 128, 222, 234, 1);
var _user$project$LineChart_Colors$cyan = A4(_elm_lang$core$Color$rgba, 0, 229, 255, 1);
var _user$project$LineChart_Colors$purpleLight = A4(_elm_lang$core$Color$rgba, 206, 147, 216, 1);
var _user$project$LineChart_Colors$purple = A4(_elm_lang$core$Color$rgba, 156, 39, 176, 1);
var _user$project$LineChart_Colors$redLight = A4(_elm_lang$core$Color$rgba, 239, 154, 154, 1);
var _user$project$LineChart_Colors$red = A4(_elm_lang$core$Color$rgba, 216, 27, 96, 1);
var _user$project$LineChart_Colors$greenLight = A4(_elm_lang$core$Color$rgba, 197, 225, 165, 1);
var _user$project$LineChart_Colors$green = A4(_elm_lang$core$Color$rgba, 67, 160, 71, 1);
var _user$project$LineChart_Colors$blueLight = A4(_elm_lang$core$Color$rgba, 128, 222, 234, 1);
var _user$project$LineChart_Colors$blue = A4(_elm_lang$core$Color$rgba, 3, 169, 244, 1);
var _user$project$LineChart_Colors$goldLight = A4(_elm_lang$core$Color$rgba, 255, 204, 128, 1);
var _user$project$LineChart_Colors$gold = A4(_elm_lang$core$Color$rgba, 205, 145, 60, 1);
var _user$project$LineChart_Colors$pinkLight = A4(_elm_lang$core$Color$rgba, 244, 143, 177, 1);
var _user$project$LineChart_Colors$pink = A4(_elm_lang$core$Color$rgba, 245, 105, 215, 1);

var _user$project$Internal_Path$bool = function (bool) {
	return bool ? '1' : '0';
};
var _user$project$Internal_Path$point = function (_p0) {
	var _p1 = _p0;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_elm_lang$core$Basics$toString(_p1.x),
		A2(
			_elm_lang$core$Basics_ops['++'],
			' ',
			_elm_lang$core$Basics$toString(_p1.y)));
};
var _user$project$Internal_Path$points = function (points) {
	return A2(
		_elm_lang$core$String$join,
		',',
		A2(_elm_lang$core$List$map, _user$project$Internal_Path$point, points));
};
var _user$project$Internal_Path$join = function (commands) {
	return A2(_elm_lang$core$String$join, ' ', commands);
};
var _user$project$Internal_Path$toString = function (command) {
	var _p2 = command;
	switch (_p2.ctor) {
		case 'Close':
			return 'Z';
		case 'Move':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'M',
				_user$project$Internal_Path$point(_p2._0));
		case 'Line':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'L',
				_user$project$Internal_Path$point(_p2._0));
		case 'Horizontal':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'H',
				_elm_lang$core$Basics$toString(_p2._0));
		case 'Vertical':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'V',
				_elm_lang$core$Basics$toString(_p2._0));
		case 'CubicBeziers':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'C',
				_user$project$Internal_Path$points(
					{
						ctor: '::',
						_0: _p2._0,
						_1: {
							ctor: '::',
							_0: _p2._1,
							_1: {
								ctor: '::',
								_0: _p2._2,
								_1: {ctor: '[]'}
							}
						}
					}));
		case 'CubicBeziersShort':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'Q',
				_user$project$Internal_Path$points(
					{
						ctor: '::',
						_0: _p2._0,
						_1: {
							ctor: '::',
							_0: _p2._1,
							_1: {ctor: '[]'}
						}
					}));
		case 'QuadraticBeziers':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'Q',
				_user$project$Internal_Path$points(
					{
						ctor: '::',
						_0: _p2._0,
						_1: {
							ctor: '::',
							_0: _p2._1,
							_1: {ctor: '[]'}
						}
					}));
		case 'QuadraticBeziersShort':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'T',
				_user$project$Internal_Path$point(_p2._0));
		default:
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'A',
				_user$project$Internal_Path$join(
					{
						ctor: '::',
						_0: _elm_lang$core$Basics$toString(_p2._0),
						_1: {
							ctor: '::',
							_0: _elm_lang$core$Basics$toString(_p2._1),
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(_p2._2),
								_1: {
									ctor: '::',
									_0: _user$project$Internal_Path$bool(_p2._3),
									_1: {
										ctor: '::',
										_0: _user$project$Internal_Path$bool(_p2._4),
										_1: {
											ctor: '::',
											_0: _user$project$Internal_Path$point(_p2._5),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}));
	}
};
var _user$project$Internal_Path$toPoint = function (command) {
	var _p3 = command;
	switch (_p3.ctor) {
		case 'Close':
			return A2(_user$project$LineChart_Coordinate$Point, 0, 0);
		case 'Move':
			return _p3._0;
		case 'Line':
			return _p3._0;
		case 'Horizontal':
			return A2(_user$project$LineChart_Coordinate$Point, _p3._0, 0);
		case 'Vertical':
			return A2(_user$project$LineChart_Coordinate$Point, 0, _p3._0);
		case 'CubicBeziers':
			return _p3._2;
		case 'CubicBeziersShort':
			return _p3._1;
		case 'QuadraticBeziers':
			return _p3._1;
		case 'QuadraticBeziersShort':
			return _p3._0;
		default:
			return _p3._5;
	}
};
var _user$project$Internal_Path$viewPath = function (attributes) {
	return A2(
		_elm_lang$svg$Svg$path,
		attributes,
		{ctor: '[]'});
};
var _user$project$Internal_Path$Close = {ctor: 'Close'};
var _user$project$Internal_Path$Arc = F6(
	function (a, b, c, d, e, f) {
		return {ctor: 'Arc', _0: a, _1: b, _2: c, _3: d, _4: e, _5: f};
	});
var _user$project$Internal_Path$QuadraticBeziersShort = function (a) {
	return {ctor: 'QuadraticBeziersShort', _0: a};
};
var _user$project$Internal_Path$QuadraticBeziers = F2(
	function (a, b) {
		return {ctor: 'QuadraticBeziers', _0: a, _1: b};
	});
var _user$project$Internal_Path$CubicBeziersShort = F2(
	function (a, b) {
		return {ctor: 'CubicBeziersShort', _0: a, _1: b};
	});
var _user$project$Internal_Path$CubicBeziers = F3(
	function (a, b, c) {
		return {ctor: 'CubicBeziers', _0: a, _1: b, _2: c};
	});
var _user$project$Internal_Path$Vertical = function (a) {
	return {ctor: 'Vertical', _0: a};
};
var _user$project$Internal_Path$Horizontal = function (a) {
	return {ctor: 'Horizontal', _0: a};
};
var _user$project$Internal_Path$Line = function (a) {
	return {ctor: 'Line', _0: a};
};
var _user$project$Internal_Path$Move = function (a) {
	return {ctor: 'Move', _0: a};
};
var _user$project$Internal_Path$translate = F2(
	function (system, command) {
		var _p4 = command;
		switch (_p4.ctor) {
			case 'Move':
				return _user$project$Internal_Path$Move(
					A2(_user$project$LineChart_Coordinate$toSvg, system, _p4._0));
			case 'Line':
				return _user$project$Internal_Path$Line(
					A2(_user$project$LineChart_Coordinate$toSvg, system, _p4._0));
			case 'Horizontal':
				return _user$project$Internal_Path$Horizontal(
					A2(_user$project$LineChart_Coordinate$toSvgX, system, _p4._0));
			case 'Vertical':
				return _user$project$Internal_Path$Vertical(
					A2(_user$project$LineChart_Coordinate$toSvgY, system, _p4._0));
			case 'CubicBeziers':
				return A3(
					_user$project$Internal_Path$CubicBeziers,
					A2(_user$project$LineChart_Coordinate$toSvg, system, _p4._0),
					A2(_user$project$LineChart_Coordinate$toSvg, system, _p4._1),
					A2(_user$project$LineChart_Coordinate$toSvg, system, _p4._2));
			case 'CubicBeziersShort':
				return A2(
					_user$project$Internal_Path$CubicBeziersShort,
					A2(_user$project$LineChart_Coordinate$toSvg, system, _p4._0),
					A2(_user$project$LineChart_Coordinate$toSvg, system, _p4._1));
			case 'QuadraticBeziers':
				return A2(
					_user$project$Internal_Path$QuadraticBeziers,
					A2(_user$project$LineChart_Coordinate$toSvg, system, _p4._0),
					A2(_user$project$LineChart_Coordinate$toSvg, system, _p4._1));
			case 'QuadraticBeziersShort':
				return _user$project$Internal_Path$QuadraticBeziersShort(
					A2(_user$project$LineChart_Coordinate$toSvg, system, _p4._0));
			case 'Arc':
				return A6(
					_user$project$Internal_Path$Arc,
					_p4._0,
					_p4._1,
					_p4._2,
					_p4._3,
					_p4._4,
					A2(_user$project$LineChart_Coordinate$toSvg, system, _p4._5));
			default:
				return _user$project$Internal_Path$Close;
		}
	});
var _user$project$Internal_Path$description = F2(
	function (system, commands) {
		return _user$project$Internal_Path$join(
			A2(
				_elm_lang$core$List$map,
				function (_p5) {
					return _user$project$Internal_Path$toString(
						A2(_user$project$Internal_Path$translate, system, _p5));
				},
				commands));
	});
var _user$project$Internal_Path$view = F3(
	function (system, attributes, commands) {
		return _user$project$Internal_Path$viewPath(
			A2(
				_elm_lang$core$Basics_ops['++'],
				attributes,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$d(
						A2(_user$project$Internal_Path$description, system, commands)),
					_1: {ctor: '[]'}
				}));
	});

var _user$project$Internal_Utils$part = F4(
	function (isReal, points, current, parts) {
		part:
		while (true) {
			var _p0 = points;
			if (_p0.ctor === '::') {
				var _p2 = _p0._1;
				var _p1 = _p0._0;
				if (isReal(_p1)) {
					var _v1 = isReal,
						_v2 = _p2,
						_v3 = A2(
						_elm_lang$core$Basics_ops['++'],
						current,
						{
							ctor: '::',
							_0: _p1,
							_1: {ctor: '[]'}
						}),
						_v4 = parts;
					isReal = _v1;
					points = _v2;
					current = _v3;
					parts = _v4;
					continue part;
				} else {
					var _v5 = isReal,
						_v6 = _p2,
						_v7 = {ctor: '[]'},
						_v8 = {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: current,
							_1: _elm_lang$core$Maybe$Just(_p1)
						},
						_1: parts
					};
					isReal = _v5;
					points = _v6;
					current = _v7;
					parts = _v8;
					continue part;
				}
			} else {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: current, _1: _elm_lang$core$Maybe$Nothing},
					_1: parts
				};
			}
		}
	});
var _user$project$Internal_Utils$magnitude = function (num) {
	return _elm_lang$core$Basics$toFloat(
		Math.pow(
			10,
			_elm_lang$core$Basics$floor(
				A2(_elm_lang$core$Basics$logBase, _elm_lang$core$Basics$e, num) / A2(_elm_lang$core$Basics$logBase, _elm_lang$core$Basics$e, 10))));
};
var _user$project$Internal_Utils$toChartAreaId = function (id) {
	return A2(_elm_lang$core$Basics_ops['++'], 'chart__chart-area--', id);
};
var _user$project$Internal_Utils$last = function (list) {
	return _elm_lang$core$List$head(
		A2(
			_elm_lang$core$List$drop,
			_elm_lang$core$List$length(list) - 1,
			list));
};
var _user$project$Internal_Utils$lastSafe = F2(
	function (first, rest) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			first,
			_user$project$Internal_Utils$last(rest));
	});
var _user$project$Internal_Utils$towardsZero = function (_p3) {
	var _p4 = _p3;
	return A3(_elm_lang$core$Basics$clamp, _p4.min, _p4.max, 0);
};
var _user$project$Internal_Utils$viewWithEdges = F2(
	function (stuff, view) {
		var _p5 = stuff;
		if (_p5.ctor === '::') {
			var _p7 = _p5._1;
			var _p6 = _p5._0;
			return A3(
				view,
				_p6,
				_p7,
				A2(_user$project$Internal_Utils$lastSafe, _p6, _p7));
		} else {
			return _elm_lang$svg$Svg$text('');
		}
	});
var _user$project$Internal_Utils$viewWithFirst = F2(
	function (stuff, view) {
		var _p8 = stuff;
		if (_p8.ctor === '::') {
			return A2(view, _p8._0, _p8._1);
		} else {
			return _elm_lang$svg$Svg$text('');
		}
	});
var _user$project$Internal_Utils$withFirst = F2(
	function (stuff, process) {
		var _p9 = stuff;
		if (_p9.ctor === '::') {
			return _elm_lang$core$Maybe$Just(
				A2(process, _p9._0, _p9._1));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _user$project$Internal_Utils$nonEmptyList = function (list) {
	return _elm_lang$core$List$isEmpty(list) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(list);
};
var _user$project$Internal_Utils$viewMaybeHtml = F2(
	function (a, view) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			_elm_lang$html$Html$text(''),
			A2(_elm_lang$core$Maybe$map, view, a));
	});
var _user$project$Internal_Utils$viewMaybe = F2(
	function (a, view) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			_elm_lang$svg$Svg$text(''),
			A2(_elm_lang$core$Maybe$map, view, a));
	});
var _user$project$Internal_Utils$viewIf = F2(
	function (condition, view) {
		return condition ? view(
			{ctor: '_Tuple0'}) : _elm_lang$svg$Svg$text('');
	});
var _user$project$Internal_Utils$indexedMap2 = F3(
	function (f, a, b) {
		var collect = F4(
			function (a, b, i, c) {
				collect:
				while (true) {
					var _p10 = {ctor: '_Tuple2', _0: a, _1: b};
					if (_p10._0.ctor === '::') {
						if (_p10._1.ctor === '::') {
							var _v14 = _p10._0._1,
								_v15 = _p10._1._1,
								_v16 = i + 1,
								_v17 = A2(
								_elm_lang$core$Basics_ops['++'],
								c,
								{
									ctor: '::',
									_0: A3(f, i, _p10._0._0, _p10._1._0),
									_1: {ctor: '[]'}
								});
							a = _v14;
							b = _v15;
							i = _v16;
							c = _v17;
							continue collect;
						} else {
							return c;
						}
					} else {
						return c;
					}
				}
			});
		return A4(
			collect,
			a,
			b,
			0,
			{ctor: '[]'});
	});
var _user$project$Internal_Utils$unzip3 = function (pairs) {
	var step = F2(
		function (_p12, _p11) {
			var _p13 = _p12;
			var _p14 = _p11;
			return {
				ctor: '_Tuple3',
				_0: {ctor: '::', _0: _p13._0, _1: _p14._0},
				_1: {ctor: '::', _0: _p13._1, _1: _p14._1},
				_2: {ctor: '::', _0: _p13._2, _1: _p14._2}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple3',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'},
			_2: {ctor: '[]'}
		},
		pairs);
};
var _user$project$Internal_Utils$concat = F3(
	function (first, second, third) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			first,
			A2(_elm_lang$core$Basics_ops['++'], second, third));
	});
var _user$project$Internal_Utils$apply2 = F3(
	function (stuff1, stuff2, toNewStuff) {
		return A2(toNewStuff, stuff1, stuff2);
	});
var _user$project$Internal_Utils$apply = F2(
	function (stuff, toNewStuff) {
		return toNewStuff(stuff);
	});

var _user$project$Internal_Svg$anchorStyle = function (anchor) {
	var anchorString = function () {
		var _p0 = anchor;
		switch (_p0.ctor) {
			case 'Start':
				return 'start';
			case 'Middle':
				return 'middle';
			default:
				return 'end';
		}
	}();
	return _elm_lang$svg$Svg_Attributes$style(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'text-anchor: ',
			A2(_elm_lang$core$Basics_ops['++'], anchorString, ';')));
};
var _user$project$Internal_Svg$label = F2(
	function (color, string) {
		return A2(
			_elm_lang$svg$Svg$text_,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$fill(color),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$style('pointer-events: none;'),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$tspan,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg$text(string),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Internal_Svg$yTick = F5(
	function (system, width, userAttributes, x, y) {
		var attributes = A3(
			_user$project$Internal_Utils$concat,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$class('chart__tick'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$stroke(
						_eskimoblood$elm_color_extra$Color_Convert$colorToHex(_user$project$LineChart_Colors$gray)),
					_1: {ctor: '[]'}
				}
			},
			userAttributes,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$x1(
					_elm_lang$core$Basics$toString(
						A2(_user$project$LineChart_Coordinate$toSvgX, system, x))),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$x2(
						_elm_lang$core$Basics$toString(
							A2(_user$project$LineChart_Coordinate$toSvgX, system, x) - width)),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$y1(
							_elm_lang$core$Basics$toString(
								A2(_user$project$LineChart_Coordinate$toSvgY, system, y))),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$y2(
								_elm_lang$core$Basics$toString(
									A2(_user$project$LineChart_Coordinate$toSvgY, system, y))),
							_1: {ctor: '[]'}
						}
					}
				}
			});
		return A2(
			_elm_lang$svg$Svg$line,
			attributes,
			{ctor: '[]'});
	});
var _user$project$Internal_Svg$xTick = F5(
	function (system, height, userAttributes, y, x) {
		var attributes = A3(
			_user$project$Internal_Utils$concat,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$stroke(
					_eskimoblood$elm_color_extra$Color_Convert$colorToHex(_user$project$LineChart_Colors$gray)),
				_1: {ctor: '[]'}
			},
			userAttributes,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$x1(
					_elm_lang$core$Basics$toString(
						A2(_user$project$LineChart_Coordinate$toSvgX, system, x))),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$x2(
						_elm_lang$core$Basics$toString(
							A2(_user$project$LineChart_Coordinate$toSvgX, system, x))),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$y1(
							_elm_lang$core$Basics$toString(
								A2(_user$project$LineChart_Coordinate$toSvgY, system, y))),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$y2(
								_elm_lang$core$Basics$toString(
									A2(_user$project$LineChart_Coordinate$toSvgY, system, y) + height)),
							_1: {ctor: '[]'}
						}
					}
				}
			});
		return A2(
			_elm_lang$svg$Svg$line,
			attributes,
			{ctor: '[]'});
	});
var _user$project$Internal_Svg$rectangle = F6(
	function (system, userAttributes, x1, x2, y1, y2) {
		var attributes = A3(
			_user$project$Internal_Utils$concat,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$fill(
					_eskimoblood$elm_color_extra$Color_Convert$colorToHex(_user$project$LineChart_Colors$gray)),
				_1: {ctor: '[]'}
			},
			userAttributes,
			{ctor: '[]'});
		return A3(
			_user$project$Internal_Path$view,
			system,
			attributes,
			{
				ctor: '::',
				_0: _user$project$Internal_Path$Move(
					{x: x1, y: y1}),
				_1: {
					ctor: '::',
					_0: _user$project$Internal_Path$Line(
						{x: x1, y: y2}),
					_1: {
						ctor: '::',
						_0: _user$project$Internal_Path$Line(
							{x: x2, y: y2}),
						_1: {
							ctor: '::',
							_0: _user$project$Internal_Path$Line(
								{x: x2, y: y1}),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});
var _user$project$Internal_Svg$vertical = F5(
	function (system, userAttributes, x, y1, y2) {
		var attributes = A3(
			_user$project$Internal_Utils$concat,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$stroke(
					_eskimoblood$elm_color_extra$Color_Convert$colorToHex(_user$project$LineChart_Colors$gray)),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$style('pointer-events: none;'),
					_1: {ctor: '[]'}
				}
			},
			userAttributes,
			{ctor: '[]'});
		return A3(
			_user$project$Internal_Path$view,
			system,
			attributes,
			{
				ctor: '::',
				_0: _user$project$Internal_Path$Move(
					{x: x, y: y1}),
				_1: {
					ctor: '::',
					_0: _user$project$Internal_Path$Line(
						{x: x, y: y1}),
					_1: {
						ctor: '::',
						_0: _user$project$Internal_Path$Line(
							{x: x, y: y2}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _user$project$Internal_Svg$verticalGrid = F3(
	function (system, userAttributes, x) {
		var attributes = A3(
			_user$project$Internal_Utils$concat,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$stroke(
					_eskimoblood$elm_color_extra$Color_Convert$colorToHex(_user$project$LineChart_Colors$gray)),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$style('pointer-events: none;'),
					_1: {ctor: '[]'}
				}
			},
			userAttributes,
			{ctor: '[]'});
		return A5(_user$project$Internal_Svg$vertical, system, attributes, x, system.y.min, system.y.max);
	});
var _user$project$Internal_Svg$horizontal = F5(
	function (system, userAttributes, y, x1, x2) {
		var attributes = A3(
			_user$project$Internal_Utils$concat,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$stroke(
					_eskimoblood$elm_color_extra$Color_Convert$colorToHex(_user$project$LineChart_Colors$gray)),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$style('pointer-events: none;'),
					_1: {ctor: '[]'}
				}
			},
			userAttributes,
			{ctor: '[]'});
		return A3(
			_user$project$Internal_Path$view,
			system,
			attributes,
			{
				ctor: '::',
				_0: _user$project$Internal_Path$Move(
					{x: x1, y: y}),
				_1: {
					ctor: '::',
					_0: _user$project$Internal_Path$Line(
						{x: x1, y: y}),
					_1: {
						ctor: '::',
						_0: _user$project$Internal_Path$Line(
							{x: x2, y: y}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _user$project$Internal_Svg$horizontalGrid = F3(
	function (system, userAttributes, y) {
		var attributes = A3(
			_user$project$Internal_Utils$concat,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$stroke(
					_eskimoblood$elm_color_extra$Color_Convert$colorToHex(_user$project$LineChart_Colors$gray)),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$style('pointer-events: none;'),
					_1: {ctor: '[]'}
				}
			},
			userAttributes,
			{ctor: '[]'});
		return A5(_user$project$Internal_Svg$horizontal, system, attributes, y, system.x.min, system.x.max);
	});
var _user$project$Internal_Svg$gridDot = F3(
	function (radius, color, point) {
		return A2(
			_elm_lang$svg$Svg$circle,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$cx(
					_elm_lang$core$Basics$toString(point.x)),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$cy(
						_elm_lang$core$Basics$toString(point.y)),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$r(
							_elm_lang$core$Basics$toString(radius)),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(
								_eskimoblood$elm_color_extra$Color_Convert$colorToHex(color)),
							_1: {ctor: '[]'}
						}
					}
				}
			},
			{ctor: '[]'});
	});
var _user$project$Internal_Svg$withinChartArea = function (_p1) {
	var _p2 = _p1;
	return _elm_lang$svg$Svg_Attributes$clipPath(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'url(#',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_user$project$Internal_Utils$toChartAreaId(_p2.id),
				')')));
};
var _user$project$Internal_Svg$End = {ctor: 'End'};
var _user$project$Internal_Svg$Middle = {ctor: 'Middle'};
var _user$project$Internal_Svg$Start = {ctor: 'Start'};
var _user$project$Internal_Svg$Transfrom = F2(
	function (a, b) {
		return {ctor: 'Transfrom', _0: a, _1: b};
	});
var _user$project$Internal_Svg$move = F3(
	function (system, x, y) {
		return A2(
			_user$project$Internal_Svg$Transfrom,
			A2(_user$project$LineChart_Coordinate$toSvgX, system, x),
			A2(_user$project$LineChart_Coordinate$toSvgY, system, y));
	});
var _user$project$Internal_Svg$offset = F2(
	function (x, y) {
		return A2(_user$project$Internal_Svg$Transfrom, x, y);
	});
var _user$project$Internal_Svg$addPosition = F2(
	function (_p4, _p3) {
		var _p5 = _p4;
		var _p6 = _p3;
		return A2(_user$project$Internal_Svg$Transfrom, _p6._0 + _p5._0, _p6._1 + _p5._1);
	});
var _user$project$Internal_Svg$toPosition = A2(
	_elm_lang$core$List$foldr,
	_user$project$Internal_Svg$addPosition,
	A2(_user$project$Internal_Svg$Transfrom, 0, 0));
var _user$project$Internal_Svg$transform = function (translations) {
	var _p7 = _user$project$Internal_Svg$toPosition(translations);
	var x = _p7._0;
	var y = _p7._1;
	return _elm_lang$svg$Svg_Attributes$transform(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'translate(',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(x),
				A2(
					_elm_lang$core$Basics_ops['++'],
					', ',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(y),
						')')))));
};

var _user$project$Internal_Junk$find = F2(
	function (hovered, data) {
		find:
		while (true) {
			var _p0 = hovered;
			if (_p0.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p1 = _p0._0;
				if (A2(
					_elm_lang$core$List$any,
					F2(
						function (x, y) {
							return _elm_lang$core$Native_Utils.eq(x, y);
						})(_p1),
					data)) {
					return _elm_lang$core$Maybe$Just(_p1);
				} else {
					var _v1 = _p0._1,
						_v2 = data;
					hovered = _v1;
					data = _v2;
					continue find;
				}
			}
		}
	});
var _user$project$Internal_Junk$findSeries = F2(
	function (hovered, datas) {
		findSeries:
		while (true) {
			var _p2 = datas;
			if (_p2.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p4 = _p2._0._2;
				var _p3 = A2(
					_user$project$Internal_Junk$find,
					{
						ctor: '::',
						_0: hovered,
						_1: {ctor: '[]'}
					},
					_p4);
				if (_p3.ctor === 'Just') {
					return _elm_lang$core$Maybe$Just(
						{ctor: '_Tuple3', _0: _p2._0._0, _1: _p2._0._1, _2: _p4});
				} else {
					var _v5 = hovered,
						_v6 = _p2._1;
					hovered = _v5;
					datas = _v6;
					continue findSeries;
				}
			}
		}
	});
var _user$project$Internal_Junk$shouldFlip = F2(
	function (system, x) {
		return _elm_lang$core$Native_Utils.cmp(x - system.x.min, system.x.max - x) > 0;
	});
var _user$project$Internal_Junk$middle = F2(
	function (r, system) {
		var range = r(system);
		return range.min + ((range.max - range.min) / 2);
	});
var _user$project$Internal_Junk$viewRow = F3(
	function (color, label, value) {
		return A2(
			_elm_lang$html$Html$p,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'margin', _1: '3px'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'color', _1: color},
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(
					A2(
						_elm_lang$core$Basics_ops['++'],
						label,
						A2(_elm_lang$core$Basics_ops['++'], ': ', value))),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Internal_Junk$viewHeader = _elm_lang$html$Html$p(
	{
		ctor: '::',
		_0: _elm_lang$html$Html_Attributes$style(
			{
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'margin-top', _1: '3px'},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'margin-bottom', _1: '5px'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'padding', _1: '3px'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'border-bottom', _1: '1px solid rgb(163, 163, 163)'},
							_1: {ctor: '[]'}
						}
					}
				}
			}),
		_1: {ctor: '[]'}
	});
var _user$project$Internal_Junk$standardStyles = {
	ctor: '::',
	_0: {ctor: '_Tuple2', _0: 'padding', _1: '5px'},
	_1: {
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: 'min-width', _1: '100px'},
		_1: {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'background', _1: 'rgba(255,255,255,0.8)'},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'border', _1: '1px solid #d3d3d3'},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'border-radius', _1: '5px'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'pointer-events', _1: 'none'},
						_1: {ctor: '[]'}
					}
				}
			}
		}
	}
};
var _user$project$Internal_Junk$hoverAt = F5(
	function (system, x, y, styles, view) {
		var yPercentage = (A2(_user$project$LineChart_Coordinate$toSvgY, system, y) * 100) / system.frame.size.height;
		var space = A2(_user$project$Internal_Junk$shouldFlip, system, x) ? -15 : 15;
		var xPercentage = ((A2(_user$project$LineChart_Coordinate$toSvgX, system, x) + space) * 100) / system.frame.size.width;
		var posititonStyles = {
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'left',
				_1: A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(xPercentage),
					'%')
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'top',
					_1: A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(yPercentage),
						'%')
				},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'margin-right', _1: '-400px'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'position', _1: 'absolute'},
						_1: {
							ctor: '::',
							_0: A2(_user$project$Internal_Junk$shouldFlip, system, x) ? {ctor: '_Tuple2', _0: 'transform', _1: 'translateX(-100%)'} : {ctor: '_Tuple2', _0: 'transform', _1: 'translateX(0)'},
							_1: {ctor: '[]'}
						}
					}
				}
			}
		};
		var containerStyles = A2(
			_elm_lang$core$Basics_ops['++'],
			_user$project$Internal_Junk$standardStyles,
			A2(_elm_lang$core$Basics_ops['++'], posititonStyles, styles));
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(containerStyles),
				_1: {ctor: '[]'}
			},
			view);
	});
var _user$project$Internal_Junk$hover = F3(
	function (system, x, styles) {
		var containerStyles = A2(
			_elm_lang$core$Basics_ops['++'],
			{
				ctor: '::',
				_0: A2(_user$project$Internal_Junk$shouldFlip, system, x) ? {ctor: '_Tuple2', _0: 'transform', _1: 'translate(-100%, -50%)'} : {ctor: '_Tuple2', _0: 'transform', _1: 'translate(0, -50%)'},
				_1: {ctor: '[]'}
			},
			styles);
		var y = A2(
			_user$project$Internal_Junk$middle,
			function (_) {
				return _.y;
			},
			system);
		return A4(_user$project$Internal_Junk$hoverAt, system, x, y, containerStyles);
	});
var _user$project$Internal_Junk$hoverManyHtml = F8(
	function (system, toX, toY, formatX, formatY, first, hovered, series) {
		var viewValue = function (_p5) {
			var _p6 = _p5;
			return A2(
				_user$project$Internal_Utils$viewMaybe,
				A2(_user$project$Internal_Junk$find, hovered, _p6._2),
				function (hovered) {
					return A3(
						_user$project$Internal_Junk$viewRow,
						_eskimoblood$elm_color_extra$Color_Convert$colorToHex(_p6._0),
						_p6._1,
						formatY(hovered));
				});
		};
		var x = A2(
			_elm_lang$core$Maybe$withDefault,
			A2(
				_user$project$Internal_Junk$middle,
				function (_) {
					return _.x;
				},
				system),
			toX(first));
		return A4(
			_user$project$Internal_Junk$hover,
			system,
			x,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _user$project$Internal_Junk$viewHeader(
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							formatX(first)),
						_1: {ctor: '[]'}
					}),
				_1: A2(_elm_lang$core$List$map, viewValue, series)
			});
	});
var _user$project$Internal_Junk$hoverOneHtml = F6(
	function (series, system, toX, toY, properties, hovered) {
		var viewValue = function (_p7) {
			var _p8 = _p7;
			return A3(
				_user$project$Internal_Junk$viewRow,
				'inherit',
				_p8._0,
				_p8._1(hovered));
		};
		var viewColorLabel = F2(
			function (color, label) {
				return A2(
					_elm_lang$html$Html$p,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$style(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'margin', _1: '0'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'color', _1: color},
									_1: {ctor: '[]'}
								}
							}),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(label),
						_1: {ctor: '[]'}
					});
			});
		var viewHeaderOne = A2(
			_user$project$Internal_Utils$viewMaybe,
			A2(_user$project$Internal_Junk$findSeries, hovered, series),
			function (_p9) {
				var _p10 = _p9;
				return _user$project$Internal_Junk$viewHeader(
					{
						ctor: '::',
						_0: A2(
							viewColorLabel,
							_eskimoblood$elm_color_extra$Color_Convert$colorToHex(_p10._0),
							_p10._1),
						_1: {ctor: '[]'}
					});
			});
		var y = A2(
			_elm_lang$core$Maybe$withDefault,
			A2(
				_user$project$Internal_Junk$middle,
				function (_) {
					return _.y;
				},
				system),
			toY(hovered));
		var x = A2(
			_elm_lang$core$Maybe$withDefault,
			A2(
				_user$project$Internal_Junk$middle,
				function (_) {
					return _.x;
				},
				system),
			toX(hovered));
		return A5(
			_user$project$Internal_Junk$hoverAt,
			system,
			x,
			y,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: viewHeaderOne,
				_1: A2(_elm_lang$core$List$map, viewValue, properties)
			});
	});
var _user$project$Internal_Junk$addBelow = F2(
	function (below, layers) {
		return _elm_lang$core$Native_Utils.update(
			layers,
			{
				below: A2(_elm_lang$core$Basics_ops['++'], below, layers.below)
			});
	});
var _user$project$Internal_Junk$getLayers = F5(
	function (series, toX, toY, system, _p11) {
		var _p12 = _p11;
		return A4(_p12._0, series, toX, toY, system);
	});
var _user$project$Internal_Junk$Layers = F3(
	function (a, b, c) {
		return {below: a, above: b, html: c};
	});
var _user$project$Internal_Junk$Config = function (a) {
	return {ctor: 'Config', _0: a};
};
var _user$project$Internal_Junk$none = _user$project$Internal_Junk$Config(
	F4(
		function (_p16, _p15, _p14, _p13) {
			return A3(
				_user$project$Internal_Junk$Layers,
				{ctor: '[]'},
				{ctor: '[]'},
				{ctor: '[]'});
		}));
var _user$project$Internal_Junk$custom = function (func) {
	return _user$project$Internal_Junk$Config(
		F3(
			function (_p19, _p18, _p17) {
				return func;
			}));
};
var _user$project$Internal_Junk$hoverOne = F2(
	function (hovered, properties) {
		return _user$project$Internal_Junk$Config(
			F4(
				function (series, toX, toY, system) {
					return {
						below: {ctor: '[]'},
						above: {ctor: '[]'},
						html: {
							ctor: '::',
							_0: A2(
								_user$project$Internal_Utils$viewMaybe,
								hovered,
								A5(_user$project$Internal_Junk$hoverOneHtml, series, system, toX, toY, properties)),
							_1: {ctor: '[]'}
						}
					};
				}));
	});
var _user$project$Internal_Junk$hoverMany = F3(
	function (hovered, formatX, formatY) {
		var _p20 = hovered;
		if (_p20.ctor === '[]') {
			return _user$project$Internal_Junk$none;
		} else {
			var _p21 = _p20._0;
			return _user$project$Internal_Junk$Config(
				F4(
					function (series, toX, toY, system) {
						var xValue = A2(
							_elm_lang$core$Maybe$withDefault,
							0,
							toX(_p21));
						return {
							below: {
								ctor: '::',
								_0: A3(
									_user$project$Internal_Svg$verticalGrid,
									system,
									{ctor: '[]'},
									xValue),
								_1: {ctor: '[]'}
							},
							above: {ctor: '[]'},
							html: {
								ctor: '::',
								_0: A8(_user$project$Internal_Junk$hoverManyHtml, system, toX, toY, formatX, formatY, _p21, hovered, series),
								_1: {ctor: '[]'}
							}
						};
					}));
		}
	});

var _user$project$LineChart_Junk$hoverAt = _user$project$Internal_Junk$hoverAt;
var _user$project$LineChart_Junk$hover = _user$project$Internal_Junk$hover;
var _user$project$LineChart_Junk$withinChartArea = _user$project$Internal_Svg$withinChartArea;
var _user$project$LineChart_Junk$label = function (color) {
	return _user$project$Internal_Svg$label(
		_eskimoblood$elm_color_extra$Color_Convert$colorToHex(color));
};
var _user$project$LineChart_Junk$circle = F5(
	function (system, radius, color, x, y) {
		return A3(
			_user$project$Internal_Svg$gridDot,
			radius,
			color,
			A2(
				_user$project$LineChart_Coordinate$toSvg,
				system,
				A2(_user$project$LineChart_Coordinate$Point, x, y)));
	});
var _user$project$LineChart_Junk$rectangle = F2(
	function (system, attributes) {
		return A2(
			_user$project$Internal_Svg$rectangle,
			system,
			{
				ctor: '::',
				_0: _user$project$LineChart_Junk$withinChartArea(system),
				_1: attributes
			});
	});
var _user$project$LineChart_Junk$horizontalCustom = F2(
	function (system, attributes) {
		return A2(
			_user$project$Internal_Svg$horizontal,
			system,
			{
				ctor: '::',
				_0: _user$project$LineChart_Junk$withinChartArea(system),
				_1: attributes
			});
	});
var _user$project$LineChart_Junk$verticalCustom = F2(
	function (system, attributes) {
		return A2(
			_user$project$Internal_Svg$vertical,
			system,
			{
				ctor: '::',
				_0: _user$project$LineChart_Junk$withinChartArea(system),
				_1: attributes
			});
	});
var _user$project$LineChart_Junk$horizontal = F3(
	function (system, attributes, at) {
		return A5(
			_user$project$Internal_Svg$horizontal,
			system,
			{
				ctor: '::',
				_0: _user$project$LineChart_Junk$withinChartArea(system),
				_1: attributes
			},
			at,
			system.x.min,
			system.x.max);
	});
var _user$project$LineChart_Junk$vertical = F3(
	function (system, attributes, at) {
		return A5(
			_user$project$Internal_Svg$vertical,
			system,
			{
				ctor: '::',
				_0: _user$project$LineChart_Junk$withinChartArea(system),
				_1: attributes
			},
			at,
			system.y.min,
			system.y.max);
	});
var _user$project$LineChart_Junk$offset = _user$project$Internal_Svg$offset;
var _user$project$LineChart_Junk$move = _user$project$Internal_Svg$move;
var _user$project$LineChart_Junk$transform = _user$project$Internal_Svg$transform;
var _user$project$LineChart_Junk$placed = F5(
	function (system, x, y, xo, yo) {
		return _elm_lang$svg$Svg$g(
			{
				ctor: '::',
				_0: _user$project$LineChart_Junk$transform(
					{
						ctor: '::',
						_0: A3(_user$project$LineChart_Junk$move, system, x, y),
						_1: {
							ctor: '::',
							_0: A2(_user$project$LineChart_Junk$offset, xo, yo),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			});
	});
var _user$project$LineChart_Junk$labelAt = F8(
	function (system, x, y, xo, yo, anchor, color, text) {
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _user$project$LineChart_Junk$transform(
					{
						ctor: '::',
						_0: A3(_user$project$LineChart_Junk$move, system, x, y),
						_1: {
							ctor: '::',
							_0: A2(_user$project$LineChart_Junk$offset, xo, yo),
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$style(
						A2(
							_elm_lang$core$Basics_ops['++'],
							'text-anchor: ',
							A2(_elm_lang$core$Basics_ops['++'], anchor, ';'))),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A2(_user$project$LineChart_Junk$label, color, text),
				_1: {ctor: '[]'}
			});
	});
var _user$project$LineChart_Junk$custom = _user$project$Internal_Junk$custom;
var _user$project$LineChart_Junk$hoverMany = _user$project$Internal_Junk$hoverMany;
var _user$project$LineChart_Junk$hoverOne = _user$project$Internal_Junk$hoverOne;
var _user$project$LineChart_Junk$default = _user$project$Internal_Junk$none;
var _user$project$LineChart_Junk$Layers = F3(
	function (a, b, c) {
		return {below: a, above: b, html: c};
	});

var _user$project$Internal_Area$opacityContainer = function (config) {
	var _p0 = config;
	switch (_p0.ctor) {
		case 'None':
			return 1;
		case 'Normal':
			return 1;
		case 'Stacked':
			return _p0._0;
		default:
			return _p0._0;
	}
};
var _user$project$Internal_Area$opacitySingle = function (config) {
	var _p1 = config;
	switch (_p1.ctor) {
		case 'None':
			return 0;
		case 'Normal':
			return _p1._0;
		case 'Stacked':
			return 1;
		default:
			return 1;
	}
};
var _user$project$Internal_Area$opacity = function (config) {
	var _p2 = config;
	switch (_p2.ctor) {
		case 'None':
			return 0;
		case 'Normal':
			return _p2._0;
		case 'Stacked':
			return _p2._0;
		default:
			return _p2._0;
	}
};
var _user$project$Internal_Area$hasArea = function (config) {
	var _p3 = config;
	switch (_p3.ctor) {
		case 'None':
			return false;
		case 'Normal':
			return true;
		case 'Stacked':
			return true;
		default:
			return true;
	}
};
var _user$project$Internal_Area$Percentage = function (a) {
	return {ctor: 'Percentage', _0: a};
};
var _user$project$Internal_Area$percentage = _user$project$Internal_Area$Percentage;
var _user$project$Internal_Area$Stacked = function (a) {
	return {ctor: 'Stacked', _0: a};
};
var _user$project$Internal_Area$stacked = _user$project$Internal_Area$Stacked;
var _user$project$Internal_Area$Normal = function (a) {
	return {ctor: 'Normal', _0: a};
};
var _user$project$Internal_Area$normal = _user$project$Internal_Area$Normal;
var _user$project$Internal_Area$None = {ctor: 'None'};
var _user$project$Internal_Area$none = _user$project$Internal_Area$None;
var _user$project$Internal_Area$default = _user$project$Internal_Area$none;

var _user$project$LineChart_Area$percentage = _user$project$Internal_Area$percentage;
var _user$project$LineChart_Area$stacked = _user$project$Internal_Area$stacked;
var _user$project$LineChart_Area$normal = _user$project$Internal_Area$normal;
var _user$project$LineChart_Area$default = _user$project$Internal_Area$none;

var _user$project$Internal_Axis_Tick$properties = function (_p0) {
	var _p1 = _p0;
	return _p1._0;
};
var _user$project$Internal_Axis_Tick$isPositive = function (direction) {
	var _p2 = direction;
	if (_p2.ctor === 'Positive') {
		return true;
	} else {
		return false;
	}
};
var _user$project$Internal_Axis_Tick$Properties = F7(
	function (a, b, c, d, e, f, g) {
		return {position: a, color: b, width: c, length: d, grid: e, direction: f, label: g};
	});
var _user$project$Internal_Axis_Tick$Config = function (a) {
	return {ctor: 'Config', _0: a};
};
var _user$project$Internal_Axis_Tick$custom = _user$project$Internal_Axis_Tick$Config;
var _user$project$Internal_Axis_Tick$Positive = {ctor: 'Positive'};
var _user$project$Internal_Axis_Tick$opposite = function (n) {
	return _user$project$Internal_Axis_Tick$custom(
		{
			position: n,
			color: _user$project$LineChart_Colors$gray,
			width: 1,
			length: 5,
			grid: true,
			direction: _user$project$Internal_Axis_Tick$Positive,
			label: _elm_lang$core$Maybe$Just(
				A2(
					_user$project$Internal_Svg$label,
					'inherit',
					_elm_lang$core$Basics$toString(n)))
		});
};
var _user$project$Internal_Axis_Tick$Negative = {ctor: 'Negative'};
var _user$project$Internal_Axis_Tick$int = function (n) {
	return _user$project$Internal_Axis_Tick$custom(
		{
			position: _elm_lang$core$Basics$toFloat(n),
			color: _user$project$LineChart_Colors$gray,
			width: 1,
			length: 5,
			grid: true,
			direction: _user$project$Internal_Axis_Tick$Negative,
			label: _elm_lang$core$Maybe$Just(
				A2(
					_user$project$Internal_Svg$label,
					'inherit',
					_elm_lang$core$Basics$toString(n)))
		});
};
var _user$project$Internal_Axis_Tick$float = function (n) {
	return _user$project$Internal_Axis_Tick$custom(
		{
			position: n,
			color: _user$project$LineChart_Colors$gray,
			width: 1,
			length: 5,
			grid: true,
			direction: _user$project$Internal_Axis_Tick$Negative,
			label: _elm_lang$core$Maybe$Just(
				A2(
					_user$project$Internal_Svg$label,
					'inherit',
					_elm_lang$core$Basics$toString(n)))
		});
};
var _user$project$Internal_Axis_Tick$gridless = function (n) {
	return _user$project$Internal_Axis_Tick$custom(
		{
			position: n,
			color: _user$project$LineChart_Colors$gray,
			width: 1,
			length: 5,
			grid: false,
			direction: _user$project$Internal_Axis_Tick$Negative,
			label: _elm_lang$core$Maybe$Just(
				A2(
					_user$project$Internal_Svg$label,
					'inherit',
					_elm_lang$core$Basics$toString(n)))
		});
};
var _user$project$Internal_Axis_Tick$labelless = function (n) {
	return _user$project$Internal_Axis_Tick$custom(
		{position: n, color: _user$project$LineChart_Colors$gray, width: 1, length: 5, grid: true, direction: _user$project$Internal_Axis_Tick$Negative, label: _elm_lang$core$Maybe$Nothing});
};
var _user$project$Internal_Axis_Tick$long = function (n) {
	return _user$project$Internal_Axis_Tick$custom(
		{
			position: n,
			color: _user$project$LineChart_Colors$gray,
			width: 1,
			length: 20,
			grid: true,
			direction: _user$project$Internal_Axis_Tick$Negative,
			label: _elm_lang$core$Maybe$Just(
				A2(
					_user$project$Internal_Svg$label,
					'inherit',
					_elm_lang$core$Basics$toString(n)))
		});
};

var _user$project$LineChart_Axis_Tick$formatBold = function (unit) {
	return function (_p0) {
		return function () {
			var _p1 = unit;
			switch (_p1.ctor) {
				case 'Millisecond':
					return function (_p2) {
						return _elm_lang$core$Basics$toString(
							_elm_lang$core$Date$toTime(_p2));
					};
				case 'Second':
					return _mgold$elm_date_format$Date_Format$format('%S');
				case 'Minute':
					return _mgold$elm_date_format$Date_Format$format('%M');
				case 'Hour':
					return _mgold$elm_date_format$Date_Format$format('%l%P');
				case 'Day':
					return _mgold$elm_date_format$Date_Format$format('%a');
				case 'Week':
					return _justinmimbs$elm_date_extra$Date_Extra$toFormattedString('\'Week\' w');
				case 'Month':
					return _mgold$elm_date_format$Date_Format$format('%b');
				default:
					return _mgold$elm_date_format$Date_Format$format('%Y');
			}
		}()(
			_elm_lang$core$Date$fromTime(_p0));
	};
};
var _user$project$LineChart_Axis_Tick$formatNorm = F2(
	function (unit, time) {
		var format2 = _justinmimbs$elm_date_extra$Date_Extra$toFormattedString;
		var format1 = _mgold$elm_date_format$Date_Format$format;
		var date = _elm_lang$core$Date$fromTime(time);
		var _p3 = unit;
		switch (_p3.ctor) {
			case 'Millisecond':
				return _elm_lang$core$Basics$toString(time);
			case 'Second':
				return A2(format1, '%S', date);
			case 'Minute':
				return A2(format1, '%M', date);
			case 'Hour':
				return A2(format1, '%l%P', date);
			case 'Day':
				return A2(format1, '%e', date);
			case 'Week':
				return A2(format2, '\'Week\' w', date);
			case 'Month':
				return A2(format1, '%b', date);
			default:
				return A2(format1, '%Y', date);
		}
	});
var _user$project$LineChart_Axis_Tick$custom = _user$project$Internal_Axis_Tick$custom;
var _user$project$LineChart_Axis_Tick$positive = _user$project$Internal_Axis_Tick$Positive;
var _user$project$LineChart_Axis_Tick$negative = _user$project$Internal_Axis_Tick$Negative;
var _user$project$LineChart_Axis_Tick$long = _user$project$Internal_Axis_Tick$long;
var _user$project$LineChart_Axis_Tick$opposite = _user$project$Internal_Axis_Tick$opposite;
var _user$project$LineChart_Axis_Tick$labelless = _user$project$Internal_Axis_Tick$labelless;
var _user$project$LineChart_Axis_Tick$gridless = _user$project$Internal_Axis_Tick$gridless;
var _user$project$LineChart_Axis_Tick$float = _user$project$Internal_Axis_Tick$float;
var _user$project$LineChart_Axis_Tick$int = _user$project$Internal_Axis_Tick$int;
var _user$project$LineChart_Axis_Tick$Time = F4(
	function (a, b, c, d) {
		return {timestamp: a, isFirst: b, interval: c, change: d};
	});
var _user$project$LineChart_Axis_Tick$Interval = F2(
	function (a, b) {
		return {unit: a, multiple: b};
	});
var _user$project$LineChart_Axis_Tick$Properties = F7(
	function (a, b, c, d, e, f, g) {
		return {position: a, color: b, width: c, length: d, grid: e, direction: f, label: g};
	});
var _user$project$LineChart_Axis_Tick$Year = {ctor: 'Year'};
var _user$project$LineChart_Axis_Tick$Month = {ctor: 'Month'};
var _user$project$LineChart_Axis_Tick$Week = {ctor: 'Week'};
var _user$project$LineChart_Axis_Tick$Day = {ctor: 'Day'};
var _user$project$LineChart_Axis_Tick$Hour = {ctor: 'Hour'};
var _user$project$LineChart_Axis_Tick$Minute = {ctor: 'Minute'};
var _user$project$LineChart_Axis_Tick$Second = {ctor: 'Second'};
var _user$project$LineChart_Axis_Tick$nextUnit = function (unit) {
	var _p4 = unit;
	switch (_p4.ctor) {
		case 'Millisecond':
			return _user$project$LineChart_Axis_Tick$Second;
		case 'Second':
			return _user$project$LineChart_Axis_Tick$Minute;
		case 'Minute':
			return _user$project$LineChart_Axis_Tick$Hour;
		case 'Hour':
			return _user$project$LineChart_Axis_Tick$Day;
		case 'Day':
			return _user$project$LineChart_Axis_Tick$Week;
		case 'Week':
			return _user$project$LineChart_Axis_Tick$Month;
		case 'Month':
			return _user$project$LineChart_Axis_Tick$Year;
		default:
			return _user$project$LineChart_Axis_Tick$Year;
	}
};
var _user$project$LineChart_Axis_Tick$format = function (_p5) {
	var _p6 = _p5;
	var _p9 = _p6.timestamp;
	var _p8 = _p6.interval;
	if (_p6.isFirst) {
		return A2(
			_user$project$LineChart_Axis_Tick$formatBold,
			_user$project$LineChart_Axis_Tick$nextUnit(_p8.unit),
			_p9);
	} else {
		var _p7 = _p6.change;
		if (_p7.ctor === 'Just') {
			return A2(_user$project$LineChart_Axis_Tick$formatBold, _p7._0, _p9);
		} else {
			return A2(_user$project$LineChart_Axis_Tick$formatNorm, _p8.unit, _p9);
		}
	}
};
var _user$project$LineChart_Axis_Tick$time = function (time) {
	return _user$project$LineChart_Axis_Tick$custom(
		{
			position: time.timestamp,
			color: _elm_lang$core$Color$gray,
			width: 1,
			length: 5,
			grid: true,
			direction: _user$project$LineChart_Axis_Tick$negative,
			label: _elm_lang$core$Maybe$Just(
				A2(
					_user$project$Internal_Svg$label,
					'inherit',
					_user$project$LineChart_Axis_Tick$format(time)))
		});
};
var _user$project$LineChart_Axis_Tick$Millisecond = {ctor: 'Millisecond'};

var _user$project$Internal_Data$isWithinRange = F2(
	function (system, point) {
		return _elm_lang$core$Native_Utils.eq(
			A3(_elm_lang$core$Basics$clamp, system.x.min, system.x.max, point.x),
			point.x) && _elm_lang$core$Native_Utils.eq(
			A3(_elm_lang$core$Basics$clamp, system.y.min, system.y.max, point.y),
			point.y);
	});
var _user$project$Internal_Data$Data = F3(
	function (a, b, c) {
		return {user: a, point: b, isReal: c};
	});
var _user$project$Internal_Data$Point = F2(
	function (a, b) {
		return {x: a, y: b};
	});

var _user$project$Internal_Axis_Range$applyY = F2(
	function (range, system) {
		var _p0 = range;
		switch (_p0.ctor) {
			case 'Padded':
				var _p4 = _p0._0;
				var _p3 = _p0._1;
				var _p1 = system;
				var frame = _p1.frame;
				var _p2 = frame;
				var size = _p2.size;
				var system_ = _elm_lang$core$Native_Utils.update(
					system,
					{
						frame: _elm_lang$core$Native_Utils.update(
							frame,
							{
								size: _elm_lang$core$Native_Utils.update(
									size,
									{
										height: A2(_elm_lang$core$Basics$max, 1, (size.height - _p4) - _p3)
									})
							})
					});
				var scale = _user$project$LineChart_Coordinate$scaleDataY(system_);
				return A2(
					_user$project$LineChart_Coordinate$Range,
					system.y.min - scale(_p4),
					system.y.max + scale(_p3));
			case 'Window':
				return A2(_user$project$LineChart_Coordinate$Range, _p0._0, _p0._1);
			default:
				return _p0._0(system.y);
		}
	});
var _user$project$Internal_Axis_Range$applyX = F2(
	function (range, system) {
		var _p5 = range;
		switch (_p5.ctor) {
			case 'Padded':
				var _p9 = _p5._0;
				var _p8 = _p5._1;
				var _p6 = system;
				var frame = _p6.frame;
				var _p7 = frame;
				var size = _p7.size;
				var system_ = _elm_lang$core$Native_Utils.update(
					system,
					{
						frame: _elm_lang$core$Native_Utils.update(
							frame,
							{
								size: _elm_lang$core$Native_Utils.update(
									size,
									{
										width: A2(_elm_lang$core$Basics$max, 1, (size.width - _p9) - _p8)
									})
							})
					});
				var scale = _user$project$LineChart_Coordinate$scaleDataX(system_);
				return A2(
					_user$project$LineChart_Coordinate$Range,
					system.x.min - scale(_p9),
					system.x.max + scale(_p8));
			case 'Window':
				return A2(_user$project$LineChart_Coordinate$Range, _p5._0, _p5._1);
			default:
				return _p5._0(system.x);
		}
	});
var _user$project$Internal_Axis_Range$Custom = function (a) {
	return {ctor: 'Custom', _0: a};
};
var _user$project$Internal_Axis_Range$custom = _user$project$Internal_Axis_Range$Custom;
var _user$project$Internal_Axis_Range$Window = F2(
	function (a, b) {
		return {ctor: 'Window', _0: a, _1: b};
	});
var _user$project$Internal_Axis_Range$window = _user$project$Internal_Axis_Range$Window;
var _user$project$Internal_Axis_Range$Padded = F2(
	function (a, b) {
		return {ctor: 'Padded', _0: a, _1: b};
	});
var _user$project$Internal_Axis_Range$padded = _user$project$Internal_Axis_Range$Padded;
var _user$project$Internal_Axis_Range$default = A2(_user$project$Internal_Axis_Range$padded, 0, 0);

var _user$project$Internal_Axis_Values_Time$magnitude = F2(
	function (interval, unit) {
		var _p0 = unit;
		if (_p0.ctor === 'Year') {
			return A2(
				_elm_lang$core$Basics$max,
				1,
				_user$project$Internal_Utils$magnitude(interval));
		} else {
			return 1;
		}
	});
var _user$project$Internal_Axis_Values_Time$highestMultiple = function (_p1) {
	return _elm_lang$core$Basics$toFloat(
		A2(
			_elm_lang$core$Maybe$withDefault,
			0,
			_elm_lang$core$List$head(
				_elm_lang$core$List$reverse(_p1))));
};
var _user$project$Internal_Axis_Values_Time$toParts = function (date) {
	return {
		ctor: '_Tuple7',
		_0: _elm_lang$core$Date$year(date),
		_1: _elm_lang$core$Date$month(date),
		_2: _elm_lang$core$Date$day(date),
		_3: _elm_lang$core$Date$hour(date),
		_4: _elm_lang$core$Date$minute(date),
		_5: _elm_lang$core$Date$second(date),
		_6: _elm_lang$core$Date$millisecond(date)
	};
};
var _user$project$Internal_Axis_Values_Time$toExtraUnit = function (unit) {
	var _p2 = unit;
	switch (_p2.ctor) {
		case 'Millisecond':
			return _justinmimbs$elm_date_extra$Date_Extra$Millisecond;
		case 'Second':
			return _justinmimbs$elm_date_extra$Date_Extra$Second;
		case 'Minute':
			return _justinmimbs$elm_date_extra$Date_Extra$Minute;
		case 'Hour':
			return _justinmimbs$elm_date_extra$Date_Extra$Hour;
		case 'Day':
			return _justinmimbs$elm_date_extra$Date_Extra$Day;
		case 'Week':
			return _justinmimbs$elm_date_extra$Date_Extra$Week;
		case 'Month':
			return _justinmimbs$elm_date_extra$Date_Extra$Month;
		default:
			return _justinmimbs$elm_date_extra$Date_Extra$Year;
	}
};
var _user$project$Internal_Axis_Values_Time$multiples = function (unit) {
	var _p3 = unit;
	switch (_p3.ctor) {
		case 'Millisecond':
			return {
				ctor: '::',
				_0: 1,
				_1: {
					ctor: '::',
					_0: 2,
					_1: {
						ctor: '::',
						_0: 5,
						_1: {
							ctor: '::',
							_0: 10,
							_1: {
								ctor: '::',
								_0: 20,
								_1: {
									ctor: '::',
									_0: 25,
									_1: {
										ctor: '::',
										_0: 50,
										_1: {
											ctor: '::',
											_0: 100,
											_1: {
												ctor: '::',
												_0: 200,
												_1: {
													ctor: '::',
													_0: 500,
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			};
		case 'Second':
			return {
				ctor: '::',
				_0: 1,
				_1: {
					ctor: '::',
					_0: 2,
					_1: {
						ctor: '::',
						_0: 5,
						_1: {
							ctor: '::',
							_0: 10,
							_1: {
								ctor: '::',
								_0: 15,
								_1: {
									ctor: '::',
									_0: 30,
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			};
		case 'Minute':
			return {
				ctor: '::',
				_0: 1,
				_1: {
					ctor: '::',
					_0: 2,
					_1: {
						ctor: '::',
						_0: 5,
						_1: {
							ctor: '::',
							_0: 10,
							_1: {
								ctor: '::',
								_0: 15,
								_1: {
									ctor: '::',
									_0: 30,
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			};
		case 'Hour':
			return {
				ctor: '::',
				_0: 1,
				_1: {
					ctor: '::',
					_0: 2,
					_1: {
						ctor: '::',
						_0: 3,
						_1: {
							ctor: '::',
							_0: 4,
							_1: {
								ctor: '::',
								_0: 6,
								_1: {
									ctor: '::',
									_0: 8,
									_1: {
										ctor: '::',
										_0: 12,
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			};
		case 'Day':
			return {
				ctor: '::',
				_0: 1,
				_1: {
					ctor: '::',
					_0: 2,
					_1: {ctor: '[]'}
				}
			};
		case 'Week':
			return {
				ctor: '::',
				_0: 1,
				_1: {
					ctor: '::',
					_0: 2,
					_1: {ctor: '[]'}
				}
			};
		case 'Month':
			return {
				ctor: '::',
				_0: 1,
				_1: {
					ctor: '::',
					_0: 2,
					_1: {
						ctor: '::',
						_0: 3,
						_1: {
							ctor: '::',
							_0: 4,
							_1: {
								ctor: '::',
								_0: 6,
								_1: {ctor: '[]'}
							}
						}
					}
				}
			};
		default:
			return {
				ctor: '::',
				_0: 1,
				_1: {
					ctor: '::',
					_0: 2,
					_1: {
						ctor: '::',
						_0: 5,
						_1: {
							ctor: '::',
							_0: 10,
							_1: {
								ctor: '::',
								_0: 20,
								_1: {
									ctor: '::',
									_0: 25,
									_1: {
										ctor: '::',
										_0: 50,
										_1: {
											ctor: '::',
											_0: 100,
											_1: {
												ctor: '::',
												_0: 200,
												_1: {
													ctor: '::',
													_0: 500,
													_1: {
														ctor: '::',
														_0: 1000,
														_1: {
															ctor: '::',
															_0: 10000,
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			};
	}
};
var _user$project$Internal_Axis_Values_Time$toMs = function (unit) {
	var _p4 = unit;
	switch (_p4.ctor) {
		case 'Millisecond':
			return 1;
		case 'Second':
			return 1000;
		case 'Minute':
			return 60000;
		case 'Hour':
			return 3600000;
		case 'Day':
			return 24 * 3600000;
		case 'Week':
			return (7 * 24) * 3600000;
		case 'Month':
			return (28 * 24) * 3600000;
		default:
			return (364 * 24) * 3600000;
	}
};
var _user$project$Internal_Axis_Values_Time$all = {
	ctor: '::',
	_0: _user$project$LineChart_Axis_Tick$Millisecond,
	_1: {
		ctor: '::',
		_0: _user$project$LineChart_Axis_Tick$Second,
		_1: {
			ctor: '::',
			_0: _user$project$LineChart_Axis_Tick$Minute,
			_1: {
				ctor: '::',
				_0: _user$project$LineChart_Axis_Tick$Hour,
				_1: {
					ctor: '::',
					_0: _user$project$LineChart_Axis_Tick$Day,
					_1: {
						ctor: '::',
						_0: _user$project$LineChart_Axis_Tick$Week,
						_1: {
							ctor: '::',
							_0: _user$project$LineChart_Axis_Tick$Month,
							_1: {
								ctor: '::',
								_0: _user$project$LineChart_Axis_Tick$Year,
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		}
	}
};
var _user$project$Internal_Axis_Values_Time$allReversed = _elm_lang$core$List$reverse(_user$project$Internal_Axis_Values_Time$all);
var _user$project$Internal_Axis_Values_Time$getUnitChange = F3(
	function (interval, value, next) {
		var equalBy = function (unit) {
			return A3(
				_justinmimbs$elm_date_extra$Date_Extra$equalBy,
				_user$project$Internal_Axis_Values_Time$toExtraUnit(unit),
				_elm_lang$core$Date$fromTime(value),
				_elm_lang$core$Date$fromTime(next));
		};
		var unitChange_ = function (units) {
			unitChange_:
			while (true) {
				var _p5 = units;
				if (_p5.ctor === '::') {
					if (_p5._0.ctor === 'Week') {
						var _v5 = _p5._1;
						units = _v5;
						continue unitChange_;
					} else {
						var _p6 = _p5._0;
						if (_elm_lang$core$Native_Utils.cmp(
							_user$project$Internal_Axis_Values_Time$toMs(_p6),
							_user$project$Internal_Axis_Values_Time$toMs(interval)) < 1) {
							return _elm_lang$core$Maybe$Nothing;
						} else {
							if (!equalBy(_p6)) {
								return _elm_lang$core$Maybe$Just(_p6);
							} else {
								var _v6 = _p5._1;
								units = _v6;
								continue unitChange_;
							}
						}
					}
				} else {
					return _elm_lang$core$Maybe$Nothing;
				}
			}
		};
		return unitChange_(_user$project$Internal_Axis_Values_Time$allReversed);
	});
var _user$project$Internal_Axis_Values_Time$next = F3(
	function (timestamp, unit, multiple) {
		return _elm_lang$core$Date$toTime(
			A3(
				_justinmimbs$elm_date_extra$Date_Extra$add,
				_user$project$Internal_Axis_Values_Time$toExtraUnit(unit),
				multiple,
				_elm_lang$core$Date$fromTime(timestamp)));
	});
var _user$project$Internal_Axis_Values_Time$ceilingTo = F2(
	function (number, prec) {
		return prec * _elm_lang$core$Basics$toFloat(
			_elm_lang$core$Basics$ceiling(number / prec));
	});
var _user$project$Internal_Axis_Values_Time$ceilingToInt = F2(
	function (number, prec) {
		return _elm_lang$core$Basics$ceiling(
			A2(
				_user$project$Internal_Axis_Values_Time$ceilingTo,
				_elm_lang$core$Basics$toFloat(number),
				_elm_lang$core$Basics$toFloat(prec)));
	});
var _user$project$Internal_Axis_Values_Time$ceilingToWeek = F2(
	function (date, multiple) {
		var weekNumber = A2(
			_user$project$Internal_Axis_Values_Time$ceilingToInt,
			_justinmimbs$elm_date_extra$Date_Extra$weekNumber(date),
			multiple);
		return A3(
			_justinmimbs$elm_date_extra$Date_Extra$fromSpec,
			_justinmimbs$elm_date_extra$Date_Extra$utc,
			_justinmimbs$elm_date_extra$Date_Extra$noTime,
			A3(
				_justinmimbs$elm_date_extra$Date_Extra$weekDate,
				_elm_lang$core$Date$year(date),
				weekNumber,
				1));
	});
var _user$project$Internal_Axis_Values_Time$ceilingToMonth = F2(
	function (date, multiple) {
		return _justinmimbs$elm_date_extra$Date_Extra_Facts$monthFromMonthNumber(
			A2(
				_user$project$Internal_Axis_Values_Time$ceilingToInt,
				_justinmimbs$elm_date_extra$Date_Extra$monthNumber(date),
				multiple));
	});
var _user$project$Internal_Axis_Values_Time$beginAt = F3(
	function (min, unit, multiple) {
		var interval = _user$project$Internal_Axis_Values_Time$toMs(unit) * _elm_lang$core$Basics$toFloat(multiple);
		var date = A2(
			_justinmimbs$elm_date_extra$Date_Extra$ceiling,
			_user$project$Internal_Axis_Values_Time$toExtraUnit(unit),
			_elm_lang$core$Date$fromTime(min));
		var _p7 = _user$project$Internal_Axis_Values_Time$toParts(date);
		var y = _p7._0;
		var m = _p7._1;
		var d = _p7._2;
		var hh = _p7._3;
		var mm = _p7._4;
		var ss = _p7._5;
		var _p8 = unit;
		switch (_p8.ctor) {
			case 'Millisecond':
				return A2(_user$project$Internal_Axis_Values_Time$ceilingTo, min, interval);
			case 'Second':
				return A2(_user$project$Internal_Axis_Values_Time$ceilingTo, min, interval);
			case 'Minute':
				return A2(_user$project$Internal_Axis_Values_Time$ceilingTo, min, interval);
			case 'Hour':
				return _elm_lang$core$Date$toTime(
					A7(
						_justinmimbs$elm_date_extra$Date_Extra$fromParts,
						y,
						m,
						d,
						A2(_user$project$Internal_Axis_Values_Time$ceilingToInt, hh, multiple),
						0,
						0,
						0));
			case 'Day':
				return _elm_lang$core$Date$toTime(
					A7(
						_justinmimbs$elm_date_extra$Date_Extra$fromParts,
						y,
						m,
						A2(_user$project$Internal_Axis_Values_Time$ceilingToInt, d, multiple),
						0,
						0,
						0,
						0));
			case 'Week':
				return _elm_lang$core$Date$toTime(
					A2(_user$project$Internal_Axis_Values_Time$ceilingToWeek, date, multiple));
			case 'Month':
				return _elm_lang$core$Date$toTime(
					A7(
						_justinmimbs$elm_date_extra$Date_Extra$fromParts,
						y,
						A2(_user$project$Internal_Axis_Values_Time$ceilingToMonth, date, multiple),
						1,
						0,
						0,
						0,
						0));
			default:
				return _elm_lang$core$Date$toTime(
					A7(
						_justinmimbs$elm_date_extra$Date_Extra$fromParts,
						A2(_user$project$Internal_Axis_Values_Time$ceilingToInt, y, multiple),
						_elm_lang$core$Date$Jan,
						1,
						0,
						0,
						0,
						0));
		}
	});
var _user$project$Internal_Axis_Values_Time$findBestMultiple = F2(
	function (interval, unit) {
		var middleOfNext = F2(
			function (m1, m2) {
				return ((_elm_lang$core$Basics$toFloat(m1) * _user$project$Internal_Axis_Values_Time$toMs(unit)) + (_elm_lang$core$Basics$toFloat(m2) * _user$project$Internal_Axis_Values_Time$toMs(unit))) / 2;
			});
		var findBest_ = function (multiples) {
			findBest_:
			while (true) {
				var _p9 = multiples;
				if (_p9.ctor === '::') {
					if (_p9._1.ctor === '::') {
						var _p11 = _p9._1._0;
						var _p10 = _p9._0;
						if (_elm_lang$core$Native_Utils.cmp(
							interval,
							A2(middleOfNext, _p10, _p11)) < 1) {
							return _p10;
						} else {
							var _v9 = {ctor: '::', _0: _p11, _1: _p9._1._1};
							multiples = _v9;
							continue findBest_;
						}
					} else {
						return _p9._0;
					}
				} else {
					return 1;
				}
			}
		};
		return findBest_(
			_user$project$Internal_Axis_Values_Time$multiples(unit));
	});
var _user$project$Internal_Axis_Values_Time$findBestUnit = F2(
	function (interval, units) {
		var middleOfNext = F2(
			function (u1, u2) {
				return ((_user$project$Internal_Axis_Values_Time$toMs(u1) * _user$project$Internal_Axis_Values_Time$highestMultiple(
					_user$project$Internal_Axis_Values_Time$multiples(u1))) + _user$project$Internal_Axis_Values_Time$toMs(u2)) / 2;
			});
		var findBest_ = F2(
			function (units, u0) {
				findBest_:
				while (true) {
					var _p12 = units;
					if (_p12.ctor === '::') {
						if (_p12._1.ctor === '::') {
							var _p14 = _p12._1._0;
							var _p13 = _p12._0;
							if (_elm_lang$core$Native_Utils.cmp(
								interval,
								A2(middleOfNext, _p13, _p14)) < 1) {
								return _p13;
							} else {
								var _v11 = {ctor: '::', _0: _p14, _1: _p12._1._1},
									_v12 = _p13;
								units = _v11;
								u0 = _v12;
								continue findBest_;
							}
						} else {
							return _p12._0;
						}
					} else {
						return _user$project$LineChart_Axis_Tick$Year;
					}
				}
			});
		return A2(findBest_, units, _user$project$LineChart_Axis_Tick$Year);
	});
var _user$project$Internal_Axis_Values_Time$values = F2(
	function (amountRough, range) {
		var intervalRough = (range.max - range.min) / _elm_lang$core$Basics$toFloat(amountRough);
		var unit = A2(_user$project$Internal_Axis_Values_Time$findBestUnit, intervalRough, _user$project$Internal_Axis_Values_Time$all);
		var multiple = A2(_user$project$Internal_Axis_Values_Time$findBestMultiple, intervalRough, unit);
		var interval = _user$project$Internal_Axis_Values_Time$toMs(unit) * _elm_lang$core$Basics$toFloat(multiple);
		var beginning = A3(_user$project$Internal_Axis_Values_Time$beginAt, range.min, unit, multiple);
		var toPositions = F2(
			function (acc, i) {
				toPositions:
				while (true) {
					var next_ = A3(_user$project$Internal_Axis_Values_Time$next, beginning, unit, i * multiple);
					if (_elm_lang$core$Native_Utils.cmp(next_, range.max) > 0) {
						return acc;
					} else {
						var _v13 = A2(
							_elm_lang$core$Basics_ops['++'],
							acc,
							{
								ctor: '::',
								_0: next_,
								_1: {ctor: '[]'}
							}),
							_v14 = i + 1;
						acc = _v13;
						i = _v14;
						continue toPositions;
					}
				}
			});
		var toTime = F3(
			function (unitChange, value, isFirst) {
				return {
					change: unitChange,
					interval: A2(_user$project$LineChart_Axis_Tick$Interval, unit, multiple),
					timestamp: value,
					isFirst: isFirst
				};
			});
		var toTimes = F3(
			function (values, unitChange, acc) {
				toTimes:
				while (true) {
					var _p15 = values;
					if (_p15.ctor === '::') {
						if (_p15._1.ctor === '::') {
							var _p17 = _p15._0;
							var _p16 = _p15._1._0;
							var newUnitChange = A3(_user$project$Internal_Axis_Values_Time$getUnitChange, unit, _p17, _p16);
							var isFirst = _elm_lang$core$List$isEmpty(acc);
							var newAcc = {
								ctor: '::',
								_0: A3(toTime, unitChange, _p17, isFirst),
								_1: acc
							};
							var _v16 = {ctor: '::', _0: _p16, _1: _p15._1._1},
								_v17 = newUnitChange,
								_v18 = newAcc;
							values = _v16;
							unitChange = _v17;
							acc = _v18;
							continue toTimes;
						} else {
							return {
								ctor: '::',
								_0: A3(
									toTime,
									unitChange,
									_p15._0,
									_elm_lang$core$List$isEmpty(acc)),
								_1: acc
							};
						}
					} else {
						return acc;
					}
				}
			});
		return A3(
			toTimes,
			A2(
				toPositions,
				{ctor: '[]'},
				0),
			_elm_lang$core$Maybe$Nothing,
			{ctor: '[]'});
	});

var _user$project$Internal_Axis_Values$ceilingTo = F2(
	function (prec, number) {
		return prec * _elm_lang$core$Basics$toFloat(
			_elm_lang$core$Basics$ceiling(number / prec));
	});
var _user$project$Internal_Axis_Values$getPrecision = function (number) {
	var _p0 = A2(
		_elm_lang$core$String$split,
		'e',
		_elm_lang$core$Basics$toString(number));
	if (((_p0.ctor === '::') && (_p0._1.ctor === '::')) && (_p0._1._1.ctor === '[]')) {
		return _elm_lang$core$Basics$abs(
			A2(
				_elm_lang$core$Result$withDefault,
				0,
				_elm_lang$core$String$toInt(_p0._1._0)));
	} else {
		var _p1 = A2(
			_elm_lang$core$String$split,
			'.',
			_elm_lang$core$Basics$toString(number));
		if (((_p1.ctor === '::') && (_p1._1.ctor === '::')) && (_p1._1._1.ctor === '[]')) {
			return _elm_lang$core$String$length(_p1._1._0);
		} else {
			return 0;
		}
	}
};
var _user$project$Internal_Axis_Values$correctFloat = function (prec) {
	return function (_p2) {
		return A2(
			_elm_lang$core$Result$withDefault,
			0,
			_elm_lang$core$String$toFloat(
				A2(_myrho$elm_round$Round$round, prec, _p2)));
	};
};
var _user$project$Internal_Axis_Values$getMultiples = F3(
	function (magnitude, allowDecimals, hasTickAmount) {
		var defaults = hasTickAmount ? {
			ctor: '::',
			_0: 1,
			_1: {
				ctor: '::',
				_0: 1.2,
				_1: {
					ctor: '::',
					_0: 1.5,
					_1: {
						ctor: '::',
						_0: 2,
						_1: {
							ctor: '::',
							_0: 2.5,
							_1: {
								ctor: '::',
								_0: 3,
								_1: {
									ctor: '::',
									_0: 4,
									_1: {
										ctor: '::',
										_0: 5,
										_1: {
											ctor: '::',
											_0: 6,
											_1: {
												ctor: '::',
												_0: 8,
												_1: {
													ctor: '::',
													_0: 10,
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		} : {
			ctor: '::',
			_0: 1,
			_1: {
				ctor: '::',
				_0: 2,
				_1: {
					ctor: '::',
					_0: 2.5,
					_1: {
						ctor: '::',
						_0: 5,
						_1: {
							ctor: '::',
							_0: 10,
							_1: {ctor: '[]'}
						}
					}
				}
			}
		};
		return allowDecimals ? defaults : (_elm_lang$core$Native_Utils.eq(magnitude, 1) ? A2(
			_elm_lang$core$List$filter,
			function (n) {
				return _elm_lang$core$Native_Utils.eq(
					_elm_lang$core$Basics$toFloat(
						_elm_lang$core$Basics$round(n)),
					n);
			},
			defaults) : ((_elm_lang$core$Native_Utils.cmp(magnitude, 0.1) < 1) ? {
			ctor: '::',
			_0: 1 / magnitude,
			_1: {ctor: '[]'}
		} : defaults));
	});
var _user$project$Internal_Axis_Values$getInterval = F3(
	function (intervalRaw, allowDecimals, hasTickAmount) {
		var magnitude = _user$project$Internal_Utils$magnitude(intervalRaw);
		var normalized = intervalRaw / magnitude;
		var findMultiple = function (multiples) {
			findMultiple:
			while (true) {
				var _p3 = multiples;
				if (_p3.ctor === '::') {
					if (_p3._1.ctor === '::') {
						var _p5 = _p3._1._0;
						var _p4 = _p3._0;
						if (_elm_lang$core$Native_Utils.cmp(normalized, (_p4 + _p5) / 2) < 1) {
							return _p4;
						} else {
							var _v3 = {ctor: '::', _0: _p5, _1: _p3._1._1};
							multiples = _v3;
							continue findMultiple;
						}
					} else {
						var _p6 = _p3._0;
						if (_elm_lang$core$Native_Utils.cmp(normalized, _p6) < 1) {
							return _p6;
						} else {
							var _v4 = _p3._1;
							multiples = _v4;
							continue findMultiple;
						}
					}
				} else {
					return 1;
				}
			}
		};
		var multiples = A3(_user$project$Internal_Axis_Values$getMultiples, magnitude, allowDecimals, hasTickAmount);
		var findMultipleExact = function (multiples) {
			findMultipleExact:
			while (true) {
				var _p7 = multiples;
				if (_p7.ctor === '::') {
					var _p8 = _p7._0;
					if (_elm_lang$core$Native_Utils.cmp(_p8 * magnitude, intervalRaw) > -1) {
						return _p8;
					} else {
						var _v6 = _p7._1;
						multiples = _v6;
						continue findMultipleExact;
					}
				} else {
					return 1;
				}
			}
		};
		var multiple = hasTickAmount ? findMultipleExact(multiples) : findMultiple(multiples);
		var precision = _user$project$Internal_Axis_Values$getPrecision(magnitude) + _user$project$Internal_Axis_Values$getPrecision(multiple);
		return A2(_user$project$Internal_Axis_Values$correctFloat, precision, multiple * magnitude);
	});
var _user$project$Internal_Axis_Values$positions = F5(
	function (range, beginning, interval, m, acc) {
		positions:
		while (true) {
			var next = A2(
				_user$project$Internal_Axis_Values$correctFloat,
				_user$project$Internal_Axis_Values$getPrecision(interval),
				beginning + (m * interval));
			if (_elm_lang$core$Native_Utils.cmp(next, range.max) > 0) {
				return acc;
			} else {
				var _v7 = range,
					_v8 = beginning,
					_v9 = interval,
					_v10 = m + 1,
					_v11 = A2(
					_elm_lang$core$Basics_ops['++'],
					acc,
					{
						ctor: '::',
						_0: next,
						_1: {ctor: '[]'}
					});
				range = _v7;
				beginning = _v8;
				interval = _v9;
				m = _v10;
				acc = _v11;
				continue positions;
			}
		}
	});
var _user$project$Internal_Axis_Values$getBeginning = F2(
	function (min, interval) {
		var multiple = min / interval;
		return _elm_lang$core$Native_Utils.eq(
			multiple,
			_elm_lang$core$Basics$toFloat(
				_elm_lang$core$Basics$round(multiple))) ? min : A2(_user$project$Internal_Axis_Values$ceilingTo, interval, min);
	});
var _user$project$Internal_Axis_Values$values = F4(
	function (allowDecimals, exact, amountRough, range) {
		var intervalRough = (range.max - range.min) / _elm_lang$core$Basics$toFloat(amountRough);
		var interval = A3(_user$project$Internal_Axis_Values$getInterval, intervalRough, allowDecimals, exact);
		var intervalSafe = _elm_lang$core$Native_Utils.eq(interval, 0) ? 1 : interval;
		var beginning = A2(_user$project$Internal_Axis_Values$getBeginning, range.min, intervalSafe);
		var amountRoughSafe = _elm_lang$core$Native_Utils.eq(amountRough, 0) ? 1 : amountRough;
		return A5(
			_user$project$Internal_Axis_Values$positions,
			range,
			beginning,
			intervalSafe,
			0,
			{ctor: '[]'});
	});
var _user$project$Internal_Axis_Values$time = _user$project$Internal_Axis_Values_Time$values;
var _user$project$Internal_Axis_Values$custom = F3(
	function (intersection, interval, range) {
		var offset = function (value) {
			return interval * _elm_lang$core$Basics$toFloat(
				_elm_lang$core$Basics$floor(value / interval));
		};
		var beginning = intersection - offset(intersection - range.min);
		return A5(
			_user$project$Internal_Axis_Values$positions,
			range,
			beginning,
			interval,
			0,
			{ctor: '[]'});
	});
var _user$project$Internal_Axis_Values$float = function (amount) {
	var _p9 = amount;
	if (_p9.ctor === 'Exactly') {
		return A3(_user$project$Internal_Axis_Values$values, true, true, _p9._0);
	} else {
		return A3(_user$project$Internal_Axis_Values$values, true, false, _p9._0);
	}
};
var _user$project$Internal_Axis_Values$int = function (amount) {
	var _p10 = amount;
	if (_p10.ctor === 'Exactly') {
		return function (_p11) {
			return A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Basics$round,
				A4(_user$project$Internal_Axis_Values$values, false, true, _p10._0, _p11));
		};
	} else {
		return function (_p12) {
			return A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Basics$round,
				A4(_user$project$Internal_Axis_Values$values, false, false, _p10._0, _p12));
		};
	}
};
var _user$project$Internal_Axis_Values$Around = function (a) {
	return {ctor: 'Around', _0: a};
};
var _user$project$Internal_Axis_Values$around = _user$project$Internal_Axis_Values$Around;
var _user$project$Internal_Axis_Values$Exactly = function (a) {
	return {ctor: 'Exactly', _0: a};
};
var _user$project$Internal_Axis_Values$exactly = _user$project$Internal_Axis_Values$Exactly;

var _user$project$Internal_Axis_Ticks$ticks = F3(
	function (dataRange, range, _p0) {
		var _p1 = _p0;
		return A2(
			_elm_lang$core$List$map,
			_user$project$Internal_Axis_Tick$properties,
			A2(_p1._0, dataRange, range));
	});
var _user$project$Internal_Axis_Ticks$Config = function (a) {
	return {ctor: 'Config', _0: a};
};
var _user$project$Internal_Axis_Ticks$custom = _user$project$Internal_Axis_Ticks$Config;
var _user$project$Internal_Axis_Ticks$intCustom = F2(
	function (amount, tick) {
		return _user$project$Internal_Axis_Ticks$custom(
			F2(
				function (data, range) {
					return A2(
						_elm_lang$core$List$map,
						tick,
						A2(
							_user$project$Internal_Axis_Values$int,
							_user$project$Internal_Axis_Values$around(amount),
							A2(_user$project$Internal_Coordinate$smallestRange, data, range)));
				}));
	});
var _user$project$Internal_Axis_Ticks$int = function (amount) {
	return A2(_user$project$Internal_Axis_Ticks$intCustom, amount, _user$project$LineChart_Axis_Tick$int);
};
var _user$project$Internal_Axis_Ticks$floatCustom = F2(
	function (amount, tick) {
		return _user$project$Internal_Axis_Ticks$custom(
			F2(
				function (data, range) {
					return A2(
						_elm_lang$core$List$map,
						tick,
						A2(
							_user$project$Internal_Axis_Values$float,
							_user$project$Internal_Axis_Values$around(amount),
							A2(_user$project$Internal_Coordinate$smallestRange, data, range)));
				}));
	});
var _user$project$Internal_Axis_Ticks$float = function (amount) {
	return A2(_user$project$Internal_Axis_Ticks$floatCustom, amount, _user$project$LineChart_Axis_Tick$float);
};
var _user$project$Internal_Axis_Ticks$timeCustom = F2(
	function (amount, tick) {
		return _user$project$Internal_Axis_Ticks$custom(
			F2(
				function (data, range) {
					return A2(
						_elm_lang$core$List$map,
						tick,
						A2(
							_user$project$Internal_Axis_Values$time,
							amount,
							A2(_user$project$Internal_Coordinate$smallestRange, data, range)));
				}));
	});
var _user$project$Internal_Axis_Ticks$time = function (amount) {
	return A2(_user$project$Internal_Axis_Ticks$timeCustom, amount, _user$project$LineChart_Axis_Tick$time);
};

var _user$project$Internal_Axis_Line$config = function (_p0) {
	var _p1 = _p0;
	return _p1._0;
};
var _user$project$Internal_Axis_Line$Properties = F5(
	function (a, b, c, d, e) {
		return {color: a, width: b, events: c, start: d, end: e};
	});
var _user$project$Internal_Axis_Line$Config = function (a) {
	return {ctor: 'Config', _0: a};
};
var _user$project$Internal_Axis_Line$custom = _user$project$Internal_Axis_Line$Config;
var _user$project$Internal_Axis_Line$none = _user$project$Internal_Axis_Line$custom(
	F2(
		function (_p3, _p2) {
			var _p4 = _p2;
			return {
				color: _user$project$LineChart_Colors$transparent,
				width: 0,
				events: {ctor: '[]'},
				start: _p4.min,
				end: _p4.max
			};
		}));
var _user$project$Internal_Axis_Line$full = function (color) {
	return _user$project$Internal_Axis_Line$custom(
		F2(
			function (data, range) {
				return {
					color: color,
					width: 1,
					events: {ctor: '[]'},
					start: range.min,
					end: range.max
				};
			}));
};
var _user$project$Internal_Axis_Line$default = _user$project$Internal_Axis_Line$full(_user$project$LineChart_Colors$gray);
var _user$project$Internal_Axis_Line$rangeFrame = function (color) {
	return _user$project$Internal_Axis_Line$custom(
		F2(
			function (data, range) {
				var smallest = A2(_user$project$Internal_Coordinate$smallestRange, data, range);
				return {
					color: color,
					width: 1,
					events: {ctor: '[]'},
					start: smallest.min,
					end: smallest.max
				};
			}));
};

var _user$project$Internal_Axis_Intersection$getY = function (_p0) {
	var _p1 = _p0;
	return function (_p2) {
		return function (_) {
			return _.y;
		}(
			_p1._0(_p2));
	};
};
var _user$project$Internal_Axis_Intersection$getX = function (_p3) {
	var _p4 = _p3;
	return function (_p5) {
		return function (_) {
			return _.x;
		}(
			_p4._0(_p5));
	};
};
var _user$project$Internal_Axis_Intersection$towardsZero = function (_p6) {
	var _p7 = _p6;
	return A3(_elm_lang$core$Basics$clamp, _p7.min, _p7.max, 0);
};
var _user$project$Internal_Axis_Intersection$Config = function (a) {
	return {ctor: 'Config', _0: a};
};
var _user$project$Internal_Axis_Intersection$custom = F2(
	function (toX, toY) {
		return _user$project$Internal_Axis_Intersection$Config(
			function (_p8) {
				var _p9 = _p8;
				return A2(
					_user$project$Internal_Data$Point,
					toX(_p9.x),
					toY(_p9.y));
			});
	});
var _user$project$Internal_Axis_Intersection$default = A2(
	_user$project$Internal_Axis_Intersection$custom,
	function (_) {
		return _.min;
	},
	function (_) {
		return _.min;
	});
var _user$project$Internal_Axis_Intersection$atOrigin = A2(_user$project$Internal_Axis_Intersection$custom, _user$project$Internal_Axis_Intersection$towardsZero, _user$project$Internal_Axis_Intersection$towardsZero);
var _user$project$Internal_Axis_Intersection$at = F2(
	function (x, y) {
		return A2(
			_user$project$Internal_Axis_Intersection$custom,
			_elm_lang$core$Basics$always(x),
			_elm_lang$core$Basics$always(y));
	});

var _user$project$Internal_Axis_Title$config = function (_p0) {
	var _p1 = _p0;
	return _p1._0;
};
var _user$project$Internal_Axis_Title$Properties = F3(
	function (a, b, c) {
		return {view: a, position: b, offset: c};
	});
var _user$project$Internal_Axis_Title$Config = function (a) {
	return {ctor: 'Config', _0: a};
};
var _user$project$Internal_Axis_Title$custom = F4(
	function (position, x, y, title) {
		return _user$project$Internal_Axis_Title$Config(
			{
				view: title,
				position: position,
				offset: {ctor: '_Tuple2', _0: x, _1: y}
			});
	});
var _user$project$Internal_Axis_Title$atPosition = F3(
	function (position, x, y) {
		return function (_p2) {
			return A4(
				_user$project$Internal_Axis_Title$custom,
				position,
				x,
				y,
				A2(_user$project$Internal_Svg$label, 'inherit', _p2));
		};
	});
var _user$project$Internal_Axis_Title$atAxisMax = function () {
	var position = F2(
		function (data, range) {
			return range.max;
		});
	return _user$project$Internal_Axis_Title$atPosition(position);
}();
var _user$project$Internal_Axis_Title$default = A2(_user$project$Internal_Axis_Title$atAxisMax, 0, 0);
var _user$project$Internal_Axis_Title$atDataMax = function () {
	var position = F2(
		function (data, range) {
			return A2(_elm_lang$core$Basics$min, data.max, range.max);
		});
	return _user$project$Internal_Axis_Title$atPosition(position);
}();

var _user$project$Internal_Axis$viewVerticalLabel = F4(
	function (system, _p0, position, view) {
		var _p1 = _p0;
		var _p3 = _p1.length;
		var _p2 = _p1.direction;
		var xOffset = _user$project$Internal_Axis_Tick$isPositive(_p2) ? (5 + _p3) : (-5 - _p3);
		var anchor = _user$project$Internal_Axis_Tick$isPositive(_p2) ? _user$project$Internal_Svg$Start : _user$project$Internal_Svg$End;
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _user$project$Internal_Svg$transform(
					{
						ctor: '::',
						_0: A3(_user$project$Internal_Svg$move, system, position.x, position.y),
						_1: {
							ctor: '::',
							_0: A2(_user$project$Internal_Svg$offset, xOffset, 5),
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: _user$project$Internal_Svg$anchorStyle(anchor),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: view,
				_1: {ctor: '[]'}
			});
	});
var _user$project$Internal_Axis$viewHorizontalLabel = F4(
	function (system, _p4, position, view) {
		var _p5 = _p4;
		var _p6 = _p5.length;
		var yOffset = _user$project$Internal_Axis_Tick$isPositive(_p5.direction) ? (-5 - _p6) : (15 + _p6);
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _user$project$Internal_Svg$transform(
					{
						ctor: '::',
						_0: A3(_user$project$Internal_Svg$move, system, position.x, position.y),
						_1: {
							ctor: '::',
							_0: A2(_user$project$Internal_Svg$offset, 0, yOffset),
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: _user$project$Internal_Svg$anchorStyle(_user$project$Internal_Svg$Middle),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: view,
				_1: {ctor: '[]'}
			});
	});
var _user$project$Internal_Axis$attributesTick = function (_p7) {
	var _p8 = _p7;
	return {
		ctor: '::',
		_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
			_elm_lang$core$Basics$toString(_p8.width)),
		_1: {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$stroke(
				_eskimoblood$elm_color_extra$Color_Convert$colorToHex(_p8.color)),
			_1: {ctor: '[]'}
		}
	};
};
var _user$project$Internal_Axis$lengthOfTick = function (_p9) {
	var _p10 = _p9;
	var _p11 = _p10.length;
	return _user$project$Internal_Axis_Tick$isPositive(_p10.direction) ? (0 - _p11) : _p11;
};
var _user$project$Internal_Axis$viewVerticalTick = F3(
	function (system, _p12, tick) {
		var _p13 = _p12;
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$class('chart__tick'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A5(
					_user$project$Internal_Svg$yTick,
					system,
					_user$project$Internal_Axis$lengthOfTick(tick),
					_user$project$Internal_Axis$attributesTick(tick),
					_p13.x,
					_p13.y),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Internal_Utils$viewMaybe,
						tick.label,
						A3(_user$project$Internal_Axis$viewVerticalLabel, system, tick, _p13)),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Internal_Axis$viewHorizontalTick = F3(
	function (system, _p14, tick) {
		var _p15 = _p14;
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$class('chart__tick'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A5(
					_user$project$Internal_Svg$xTick,
					system,
					_user$project$Internal_Axis$lengthOfTick(tick),
					_user$project$Internal_Axis$attributesTick(tick),
					_p15.y,
					_p15.x),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Internal_Utils$viewMaybe,
						tick.label,
						A3(_user$project$Internal_Axis$viewHorizontalLabel, system, tick, _p15)),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Internal_Axis$attributesLine = F2(
	function (system, _p16) {
		var _p17 = _p16;
		return A2(
			_elm_lang$core$Basics_ops['++'],
			_p17.events,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
					_elm_lang$core$Basics$toString(_p17.width)),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$stroke(
						_eskimoblood$elm_color_extra$Color_Convert$colorToHex(_p17.color)),
					_1: {
						ctor: '::',
						_0: _user$project$Internal_Svg$withinChartArea(system),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _user$project$Internal_Axis$viewVerticalAxisLine = F3(
	function (system, axisPosition, config) {
		return A5(
			_user$project$Internal_Svg$vertical,
			system,
			A2(_user$project$Internal_Axis$attributesLine, system, config),
			axisPosition,
			config.start,
			config.end);
	});
var _user$project$Internal_Axis$viewHorizontalAxisLine = F3(
	function (system, axisPosition, config) {
		return A5(
			_user$project$Internal_Svg$horizontal,
			system,
			A2(_user$project$Internal_Axis$attributesLine, system, config),
			axisPosition,
			config.start,
			config.end);
	});
var _user$project$Internal_Axis$viewVerticalTitle = F3(
	function (system, at, _p18) {
		var _p19 = _p18;
		var _p21 = _p19.title;
		var _p20 = _p21.offset;
		var xOffset = _p20._0;
		var yOffset = _p20._1;
		var position = at(
			A2(_p21.position, system.yData, system.y));
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$class('chart__title'),
				_1: {
					ctor: '::',
					_0: _user$project$Internal_Svg$transform(
						{
							ctor: '::',
							_0: A3(_user$project$Internal_Svg$move, system, position.x, position.y),
							_1: {
								ctor: '::',
								_0: A2(_user$project$Internal_Svg$offset, xOffset + 2, yOffset - 10),
								_1: {ctor: '[]'}
							}
						}),
					_1: {
						ctor: '::',
						_0: _user$project$Internal_Svg$anchorStyle(_user$project$Internal_Svg$End),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: _p21.view,
				_1: {ctor: '[]'}
			});
	});
var _user$project$Internal_Axis$viewHorizontalTitle = F3(
	function (system, at, _p22) {
		var _p23 = _p22;
		var _p25 = _p23.title;
		var _p24 = _p25.offset;
		var xOffset = _p24._0;
		var yOffset = _p24._1;
		var position = at(
			A2(_p25.position, system.xData, system.x));
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$class('chart__title'),
				_1: {
					ctor: '::',
					_0: _user$project$Internal_Svg$transform(
						{
							ctor: '::',
							_0: A3(_user$project$Internal_Svg$move, system, position.x, position.y),
							_1: {
								ctor: '::',
								_0: A2(_user$project$Internal_Svg$offset, xOffset + 15, yOffset + 5),
								_1: {ctor: '[]'}
							}
						}),
					_1: {
						ctor: '::',
						_0: _user$project$Internal_Svg$anchorStyle(_user$project$Internal_Svg$Start),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: _p25.view,
				_1: {ctor: '[]'}
			});
	});
var _user$project$Internal_Axis$viewVertical = F3(
	function (system, intersection, _p26) {
		var _p27 = _p26;
		var _p28 = _p27._0;
		var viewConfig = {
			line: A3(_user$project$Internal_Axis_Line$config, _p28.axisLine, system.yData, system.y),
			ticks: A3(_user$project$Internal_Axis_Ticks$ticks, system.yData, system.y, _p28.ticks),
			intersection: A2(_user$project$Internal_Axis_Intersection$getX, intersection, system),
			title: _user$project$Internal_Axis_Title$config(_p28.title)
		};
		var at = function (y) {
			return {x: viewConfig.intersection, y: y};
		};
		var viewTick = function (tick) {
			return A3(
				_user$project$Internal_Axis$viewVerticalTick,
				system,
				at(tick.position),
				tick);
		};
		var viewAxisLine = A2(_user$project$Internal_Axis$viewVerticalAxisLine, system, viewConfig.intersection);
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$class('chart__axis--vertical'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A3(_user$project$Internal_Axis$viewVerticalTitle, system, at, viewConfig),
				_1: {
					ctor: '::',
					_0: viewAxisLine(viewConfig.line),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$g,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$class('chart__ticks'),
								_1: {ctor: '[]'}
							},
							A2(_elm_lang$core$List$map, viewTick, viewConfig.ticks)),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _user$project$Internal_Axis$viewHorizontal = F3(
	function (system, intersection, _p29) {
		var _p30 = _p29;
		var _p31 = _p30._0;
		var viewConfig = {
			line: A3(_user$project$Internal_Axis_Line$config, _p31.axisLine, system.xData, system.x),
			ticks: A3(_user$project$Internal_Axis_Ticks$ticks, system.xData, system.x, _p31.ticks),
			intersection: A2(_user$project$Internal_Axis_Intersection$getY, intersection, system),
			title: _user$project$Internal_Axis_Title$config(_p31.title)
		};
		var at = function (x) {
			return {x: x, y: viewConfig.intersection};
		};
		var viewTick = function (tick) {
			return A3(
				_user$project$Internal_Axis$viewHorizontalTick,
				system,
				at(tick.position),
				tick);
		};
		var viewAxisLine = A2(_user$project$Internal_Axis$viewHorizontalAxisLine, system, viewConfig.intersection);
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$class('chart__axis--horizontal'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A3(_user$project$Internal_Axis$viewHorizontalTitle, system, at, viewConfig),
				_1: {
					ctor: '::',
					_0: viewAxisLine(viewConfig.line),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$g,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$class('chart__ticks'),
								_1: {ctor: '[]'}
							},
							A2(_elm_lang$core$List$map, viewTick, viewConfig.ticks)),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _user$project$Internal_Axis$ticks = function (_p32) {
	var _p33 = _p32;
	return _p33._0.ticks;
};
var _user$project$Internal_Axis$range = function (_p34) {
	var _p35 = _p34;
	return _p35._0.range;
};
var _user$project$Internal_Axis$pixels = function (_p36) {
	var _p37 = _p36;
	return _elm_lang$core$Basics$toFloat(_p37._0.pixels);
};
var _user$project$Internal_Axis$variable = function (_p38) {
	var _p39 = _p38;
	return _p39._0.variable;
};
var _user$project$Internal_Axis$Properties = F6(
	function (a, b, c, d, e, f) {
		return {title: a, variable: b, pixels: c, range: d, axisLine: e, ticks: f};
	});
var _user$project$Internal_Axis$ViewConfig = F4(
	function (a, b, c, d) {
		return {line: a, ticks: b, intersection: c, title: d};
	});
var _user$project$Internal_Axis$Config = function (a) {
	return {ctor: 'Config', _0: a};
};
var _user$project$Internal_Axis$custom = _user$project$Internal_Axis$Config;
var _user$project$Internal_Axis$default = F3(
	function (pixels, title, variable) {
		return _user$project$Internal_Axis$custom(
			{
				title: A3(_user$project$Internal_Axis_Title$atDataMax, 0, 0, title),
				variable: function (_p40) {
					return _elm_lang$core$Maybe$Just(
						variable(_p40));
				},
				pixels: pixels,
				range: A2(_user$project$Internal_Axis_Range$padded, 20, 20),
				axisLine: _user$project$Internal_Axis_Line$rangeFrame(_user$project$LineChart_Colors$gray),
				ticks: _user$project$Internal_Axis_Ticks$custom(
					F2(
						function (data, range) {
							var rangeLong = range.max - range.min;
							var smallest = A2(_user$project$Internal_Coordinate$smallestRange, data, range);
							var rangeSmall = smallest.max - smallest.min;
							var diff = 1 - ((rangeLong - rangeSmall) / rangeLong);
							var amount = _elm_lang$core$Basics$round(
								(diff * _elm_lang$core$Basics$toFloat(pixels)) / 90);
							return A2(
								_elm_lang$core$List$map,
								_user$project$LineChart_Axis_Tick$float,
								A2(
									_user$project$Internal_Axis_Values$float,
									_user$project$Internal_Axis_Values$around(amount),
									smallest));
						}))
			});
	});
var _user$project$Internal_Axis$full = F3(
	function (pixels, title, variable) {
		return _user$project$Internal_Axis$custom(
			{
				title: A3(_user$project$Internal_Axis_Title$atAxisMax, 0, 0, title),
				variable: function (_p41) {
					return _elm_lang$core$Maybe$Just(
						variable(_p41));
				},
				pixels: pixels,
				range: A2(_user$project$Internal_Axis_Range$padded, 20, 20),
				axisLine: _user$project$Internal_Axis_Line$default,
				ticks: _user$project$Internal_Axis_Ticks$custom(
					F2(
						function (data, range) {
							var amount = (pixels / 90) | 0;
							var largest = A2(_user$project$Internal_Coordinate$largestRange, data, range);
							return A2(
								_elm_lang$core$List$map,
								_user$project$LineChart_Axis_Tick$float,
								A2(
									_user$project$Internal_Axis_Values$float,
									_user$project$Internal_Axis_Values$around(amount),
									largest));
						}))
			});
	});
var _user$project$Internal_Axis$time = F3(
	function (pixels, title, variable) {
		return _user$project$Internal_Axis$custom(
			{
				title: A3(_user$project$Internal_Axis_Title$atDataMax, 0, 0, title),
				variable: function (_p42) {
					return _elm_lang$core$Maybe$Just(
						variable(_p42));
				},
				pixels: pixels,
				range: A2(_user$project$Internal_Axis_Range$padded, 20, 20),
				axisLine: _user$project$Internal_Axis_Line$rangeFrame(_user$project$LineChart_Colors$gray),
				ticks: _user$project$Internal_Axis_Ticks$custom(
					F2(
						function (data, range) {
							var rangeLong = range.max - range.min;
							var smallest = A2(_user$project$Internal_Coordinate$smallestRange, data, range);
							var rangeSmall = smallest.max - smallest.min;
							var diff = 1 - ((rangeLong - rangeSmall) / rangeLong);
							var amount = _elm_lang$core$Basics$round(
								(diff * _elm_lang$core$Basics$toFloat(pixels)) / 90);
							return A2(
								_elm_lang$core$List$map,
								_user$project$LineChart_Axis_Tick$time,
								A2(_user$project$Internal_Axis_Values$time, amount, smallest));
						}))
			});
	});
var _user$project$Internal_Axis$none = F2(
	function (pixels, variable) {
		return _user$project$Internal_Axis$custom(
			{
				title: _user$project$Internal_Axis_Title$default(''),
				variable: function (_p43) {
					return _elm_lang$core$Maybe$Just(
						variable(_p43));
				},
				pixels: pixels,
				range: A2(_user$project$Internal_Axis_Range$padded, 20, 20),
				axisLine: _user$project$Internal_Axis_Line$none,
				ticks: _user$project$Internal_Axis_Ticks$custom(
					F2(
						function (_p45, _p44) {
							return {ctor: '[]'};
						}))
			});
	});
var _user$project$Internal_Axis$picky = F4(
	function (pixels, title, variable, ticks) {
		return _user$project$Internal_Axis$custom(
			{
				title: A3(_user$project$Internal_Axis_Title$atAxisMax, 0, 0, title),
				variable: function (_p46) {
					return _elm_lang$core$Maybe$Just(
						variable(_p46));
				},
				pixels: pixels,
				range: A2(_user$project$Internal_Axis_Range$padded, 20, 20),
				axisLine: _user$project$Internal_Axis_Line$default,
				ticks: _user$project$Internal_Axis_Ticks$custom(
					F2(
						function (_p48, _p47) {
							return A2(_elm_lang$core$List$map, _user$project$LineChart_Axis_Tick$float, ticks);
						}))
			});
	});

var _user$project$LineChart_Axis_Range$custom = _user$project$Internal_Axis_Range$custom;
var _user$project$LineChart_Axis_Range$window = _user$project$Internal_Axis_Range$window;
var _user$project$LineChart_Axis_Range$padded = _user$project$Internal_Axis_Range$padded;
var _user$project$LineChart_Axis_Range$default = _user$project$Internal_Axis_Range$default;

var _user$project$LineChart_Axis_Line$custom = _user$project$Internal_Axis_Line$custom;
var _user$project$LineChart_Axis_Line$none = _user$project$Internal_Axis_Line$none;
var _user$project$LineChart_Axis_Line$rangeFrame = _user$project$Internal_Axis_Line$rangeFrame;
var _user$project$LineChart_Axis_Line$full = _user$project$Internal_Axis_Line$full;
var _user$project$LineChart_Axis_Line$default = _user$project$Internal_Axis_Line$default;
var _user$project$LineChart_Axis_Line$Properties = F5(
	function (a, b, c, d, e) {
		return {color: a, width: b, events: c, start: d, end: e};
	});

var _user$project$LineChart_Axis_Ticks$custom = _user$project$Internal_Axis_Ticks$custom;
var _user$project$LineChart_Axis_Ticks$timeCustom = _user$project$Internal_Axis_Ticks$timeCustom;
var _user$project$LineChart_Axis_Ticks$floatCustom = _user$project$Internal_Axis_Ticks$floatCustom;
var _user$project$LineChart_Axis_Ticks$intCustom = _user$project$Internal_Axis_Ticks$intCustom;
var _user$project$LineChart_Axis_Ticks$float = _user$project$Internal_Axis_Ticks$float;
var _user$project$LineChart_Axis_Ticks$time = _user$project$Internal_Axis_Ticks$time;
var _user$project$LineChart_Axis_Ticks$int = _user$project$Internal_Axis_Ticks$int;
var _user$project$LineChart_Axis_Ticks$default = _user$project$Internal_Axis_Ticks$float(5);

var _user$project$LineChart_Axis$custom = _user$project$Internal_Axis$custom;
var _user$project$LineChart_Axis$none = _user$project$Internal_Axis$none;
var _user$project$LineChart_Axis$picky = _user$project$Internal_Axis$picky;
var _user$project$LineChart_Axis$time = _user$project$Internal_Axis$time;
var _user$project$LineChart_Axis$full = _user$project$Internal_Axis$full;
var _user$project$LineChart_Axis$default = _user$project$Internal_Axis$default;
var _user$project$LineChart_Axis$Properties = F6(
	function (a, b, c, d, e, f) {
		return {title: a, variable: b, pixels: c, range: d, axisLine: e, ticks: f};
	});

var _user$project$Internal_Dots$varietyAttributes = F2(
	function (color, variety) {
		var _p0 = variety;
		switch (_p0.ctor) {
			case 'Empty':
				return {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$stroke(
						_eskimoblood$elm_color_extra$Color_Convert$colorToHex(color)),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
							_elm_lang$core$Basics$toString(_p0._0)),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill('white'),
							_1: {ctor: '[]'}
						}
					}
				};
			case 'Aura':
				return {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$stroke(
						_eskimoblood$elm_color_extra$Color_Convert$colorToHex(color)),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
							_elm_lang$core$Basics$toString(_p0._0)),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$strokeOpacity(
								_elm_lang$core$Basics$toString(_p0._1)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(
									_eskimoblood$elm_color_extra$Color_Convert$colorToHex(color)),
								_1: {ctor: '[]'}
							}
						}
					}
				};
			case 'Disconnected':
				return {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$stroke('white'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
							_elm_lang$core$Basics$toString(_p0._0)),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(
								_eskimoblood$elm_color_extra$Color_Convert$colorToHex(color)),
							_1: {ctor: '[]'}
						}
					}
				};
			default:
				return {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$fill(
						_eskimoblood$elm_color_extra$Color_Convert$colorToHex(color)),
					_1: {ctor: '[]'}
				};
		}
	});
var _user$project$Internal_Dots$pathPlus = F2(
	function (area, point) {
		var side = _elm_lang$core$Basics$sqrt(area / 5);
		var r3 = side;
		var r6 = side / 2;
		var commands = {
			ctor: '::',
			_0: A2(
				_elm_lang$core$Basics_ops['++'],
				'M',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(point.x - r6),
					A2(
						_elm_lang$core$Basics_ops['++'],
						' ',
						_elm_lang$core$Basics$toString((point.y - r3) - r6)))),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$core$Basics_ops['++'],
					'v',
					_elm_lang$core$Basics$toString(r3)),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$core$Basics_ops['++'],
						'h',
						_elm_lang$core$Basics$toString(0 - r3)),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$core$Basics_ops['++'],
							'v',
							_elm_lang$core$Basics$toString(r3)),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$core$Basics_ops['++'],
								'h',
								_elm_lang$core$Basics$toString(r3)),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$core$Basics_ops['++'],
									'v',
									_elm_lang$core$Basics$toString(r3)),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$core$Basics_ops['++'],
										'h',
										_elm_lang$core$Basics$toString(r3)),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$core$Basics_ops['++'],
											'v',
											_elm_lang$core$Basics$toString(0 - r3)),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$core$Basics_ops['++'],
												'h',
												_elm_lang$core$Basics$toString(r3)),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$core$Basics_ops['++'],
													'v',
													_elm_lang$core$Basics$toString(0 - r3)),
												_1: {
													ctor: '::',
													_0: A2(
														_elm_lang$core$Basics_ops['++'],
														'h',
														_elm_lang$core$Basics$toString(0 - r3)),
													_1: {
														ctor: '::',
														_0: A2(
															_elm_lang$core$Basics_ops['++'],
															'v',
															_elm_lang$core$Basics$toString(0 - r3)),
														_1: {
															ctor: '::',
															_0: A2(
																_elm_lang$core$Basics_ops['++'],
																'h',
																_elm_lang$core$Basics$toString(0 - r3)),
															_1: {
																ctor: '::',
																_0: A2(
																	_elm_lang$core$Basics_ops['++'],
																	'v',
																	_elm_lang$core$Basics$toString(r3)),
																_1: {ctor: '[]'}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		};
		return A2(_elm_lang$core$String$join, ' ', commands);
	});
var _user$project$Internal_Dots$pathTriangle = F2(
	function (area, point) {
		var side = _elm_lang$core$Basics$sqrt(
			(area * 4) / _elm_lang$core$Basics$sqrt(3));
		var height = (_elm_lang$core$Basics$sqrt(3) * side) / 2;
		var fromMiddle = height - ((_elm_lang$core$Basics$tan(
			_elm_lang$core$Basics$degrees(30)) * side) / 2);
		var commands = {
			ctor: '::',
			_0: A2(
				_elm_lang$core$Basics_ops['++'],
				'M',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(point.x),
					A2(
						_elm_lang$core$Basics_ops['++'],
						' ',
						_elm_lang$core$Basics$toString(point.y - fromMiddle)))),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$core$Basics_ops['++'],
					'l',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString((0 - side) / 2),
						A2(
							_elm_lang$core$Basics_ops['++'],
							' ',
							_elm_lang$core$Basics$toString(height)))),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$core$Basics_ops['++'],
						'h',
						_elm_lang$core$Basics$toString(side)),
					_1: {
						ctor: '::',
						_0: 'z',
						_1: {ctor: '[]'}
					}
				}
			}
		};
		return A2(_elm_lang$core$String$join, ' ', commands);
	});
var _user$project$Internal_Dots$viewCross = F5(
	function (events, variety, color, area, point) {
		var rotation = A2(
			_elm_lang$core$Basics_ops['++'],
			'rotate(45 ',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(point.x),
				A2(
					_elm_lang$core$Basics_ops['++'],
					' ',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(point.y),
						')'))));
		var attributes = {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$d(
				A2(_user$project$Internal_Dots$pathPlus, area, point)),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$transform(rotation),
				_1: {ctor: '[]'}
			}
		};
		return A2(
			_elm_lang$svg$Svg$path,
			A2(
				_elm_lang$core$Basics_ops['++'],
				events,
				A2(
					_elm_lang$core$Basics_ops['++'],
					attributes,
					A2(_user$project$Internal_Dots$varietyAttributes, color, variety))),
			{ctor: '[]'});
	});
var _user$project$Internal_Dots$viewPlus = F5(
	function (events, variety, color, area, point) {
		var attributes = {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$d(
				A2(_user$project$Internal_Dots$pathPlus, area, point)),
			_1: {ctor: '[]'}
		};
		return A2(
			_elm_lang$svg$Svg$path,
			A2(
				_elm_lang$core$Basics_ops['++'],
				events,
				A2(
					_elm_lang$core$Basics_ops['++'],
					attributes,
					A2(_user$project$Internal_Dots$varietyAttributes, color, variety))),
			{ctor: '[]'});
	});
var _user$project$Internal_Dots$viewDiamond = F5(
	function (events, variety, color, area, point) {
		var rotation = A2(
			_elm_lang$core$Basics_ops['++'],
			'rotate(45 ',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(point.x),
				A2(
					_elm_lang$core$Basics_ops['++'],
					' ',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(point.y),
						')'))));
		var side = _elm_lang$core$Basics$sqrt(area);
		var attributes = {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$x(
				_elm_lang$core$Basics$toString(point.x - (side / 2))),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$y(
					_elm_lang$core$Basics$toString(point.y - (side / 2))),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$width(
						_elm_lang$core$Basics$toString(side)),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$height(
							_elm_lang$core$Basics$toString(side)),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$transform(rotation),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		};
		return A2(
			_elm_lang$svg$Svg$rect,
			A2(
				_elm_lang$core$Basics_ops['++'],
				events,
				A2(
					_elm_lang$core$Basics_ops['++'],
					attributes,
					A2(_user$project$Internal_Dots$varietyAttributes, color, variety))),
			{ctor: '[]'});
	});
var _user$project$Internal_Dots$viewSquare = F5(
	function (events, variety, color, area, point) {
		var side = _elm_lang$core$Basics$sqrt(area);
		var attributes = {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$x(
				_elm_lang$core$Basics$toString(point.x - (side / 2))),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$y(
					_elm_lang$core$Basics$toString(point.y - (side / 2))),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$width(
						_elm_lang$core$Basics$toString(side)),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$height(
							_elm_lang$core$Basics$toString(side)),
						_1: {ctor: '[]'}
					}
				}
			}
		};
		return A2(
			_elm_lang$svg$Svg$rect,
			A2(
				_elm_lang$core$Basics_ops['++'],
				events,
				A2(
					_elm_lang$core$Basics_ops['++'],
					attributes,
					A2(_user$project$Internal_Dots$varietyAttributes, color, variety))),
			{ctor: '[]'});
	});
var _user$project$Internal_Dots$viewTriangle = F5(
	function (events, variety, color, area, point) {
		var attributes = {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$d(
				A2(_user$project$Internal_Dots$pathTriangle, area, point)),
			_1: {ctor: '[]'}
		};
		return A2(
			_elm_lang$svg$Svg$path,
			A2(
				_elm_lang$core$Basics_ops['++'],
				events,
				A2(
					_elm_lang$core$Basics_ops['++'],
					attributes,
					A2(_user$project$Internal_Dots$varietyAttributes, color, variety))),
			{ctor: '[]'});
	});
var _user$project$Internal_Dots$viewCircle = F5(
	function (events, variety, color, area, point) {
		var radius = _elm_lang$core$Basics$sqrt(area / _elm_lang$core$Basics$pi);
		var attributes = {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$cx(
				_elm_lang$core$Basics$toString(point.x)),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$cy(
					_elm_lang$core$Basics$toString(point.y)),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$r(
						_elm_lang$core$Basics$toString(radius)),
					_1: {ctor: '[]'}
				}
			}
		};
		return A2(
			_elm_lang$svg$Svg$circle,
			A2(
				_elm_lang$core$Basics_ops['++'],
				events,
				A2(
					_elm_lang$core$Basics_ops['++'],
					attributes,
					A2(_user$project$Internal_Dots$varietyAttributes, color, variety))),
			{ctor: '[]'});
	});
var _user$project$Internal_Dots$viewShape = F5(
	function (system, _p1, shape, color, point) {
		var _p2 = _p1;
		var view = function () {
			var _p3 = shape;
			switch (_p3.ctor) {
				case 'Circle':
					return _user$project$Internal_Dots$viewCircle;
				case 'Triangle':
					return _user$project$Internal_Dots$viewTriangle;
				case 'Square':
					return _user$project$Internal_Dots$viewSquare;
				case 'Diamond':
					return _user$project$Internal_Dots$viewDiamond;
				case 'Cross':
					return _user$project$Internal_Dots$viewCross;
				case 'Plus':
					return _user$project$Internal_Dots$viewPlus;
				default:
					return F5(
						function (_p8, _p7, _p6, _p5, _p4) {
							return _elm_lang$svg$Svg$text('');
						});
			}
		}();
		var pointSvg = A2(_user$project$LineChart_Coordinate$toSvg, system, point);
		var size = (2 * _elm_lang$core$Basics$pi) * _p2.radius;
		return A5(
			view,
			{ctor: '[]'},
			_p2.variety,
			color,
			size,
			pointSvg);
	});
var _user$project$Internal_Dots$viewSample = F5(
	function (_p9, shape, color, system, data) {
		var _p10 = _p9;
		var _p11 = _p10._0.legend(
			A2(
				_elm_lang$core$List$map,
				function (_) {
					return _.user;
				},
				data));
		var style = _p11._0;
		return A4(_user$project$Internal_Dots$viewShape, system, style, shape, color);
	});
var _user$project$Internal_Dots$view = F2(
	function (_p12, data) {
		var _p13 = _p12;
		var _p14 = _p13.dotsConfig;
		var config = _p14._0;
		var _p15 = config.individual(data.user);
		var style = _p15._0;
		return A5(_user$project$Internal_Dots$viewShape, _p13.system, style, _p13.shape, _p13.color, data.point);
	});
var _user$project$Internal_Dots$StyleConfig = F2(
	function (a, b) {
		return {radius: a, variety: b};
	});
var _user$project$Internal_Dots$Arguments = F4(
	function (a, b, c, d) {
		return {system: a, dotsConfig: b, shape: c, color: d};
	});
var _user$project$Internal_Dots$Config = function (a) {
	return {ctor: 'Config', _0: a};
};
var _user$project$Internal_Dots$custom = function (style) {
	return _user$project$Internal_Dots$Config(
		{
			legend: function (_p16) {
				return style;
			},
			individual: function (_p17) {
				return style;
			}
		});
};
var _user$project$Internal_Dots$customAny = _user$project$Internal_Dots$Config;
var _user$project$Internal_Dots$Style = function (a) {
	return {ctor: 'Style', _0: a};
};
var _user$project$Internal_Dots$style = F2(
	function (radius, variety) {
		return _user$project$Internal_Dots$Style(
			{radius: radius, variety: variety});
	});
var _user$project$Internal_Dots$Full = {ctor: 'Full'};
var _user$project$Internal_Dots$full = function (radius) {
	return A2(_user$project$Internal_Dots$style, radius, _user$project$Internal_Dots$Full);
};
var _user$project$Internal_Dots$Aura = F2(
	function (a, b) {
		return {ctor: 'Aura', _0: a, _1: b};
	});
var _user$project$Internal_Dots$aura = F3(
	function (radius, aura, opacity) {
		return A2(
			_user$project$Internal_Dots$style,
			radius,
			A2(_user$project$Internal_Dots$Aura, aura, opacity));
	});
var _user$project$Internal_Dots$Disconnected = function (a) {
	return {ctor: 'Disconnected', _0: a};
};
var _user$project$Internal_Dots$disconnected = F2(
	function (radius, border) {
		return A2(
			_user$project$Internal_Dots$style,
			radius,
			_user$project$Internal_Dots$Disconnected(border));
	});
var _user$project$Internal_Dots$default = _user$project$Internal_Dots$Config(
	{
		legend: function (_p18) {
			return A2(_user$project$Internal_Dots$disconnected, 10, 2);
		},
		individual: function (_p19) {
			return A2(_user$project$Internal_Dots$disconnected, 10, 2);
		}
	});
var _user$project$Internal_Dots$Empty = function (a) {
	return {ctor: 'Empty', _0: a};
};
var _user$project$Internal_Dots$empty = F2(
	function (radius, border) {
		return A2(
			_user$project$Internal_Dots$style,
			radius,
			_user$project$Internal_Dots$Empty(border));
	});
var _user$project$Internal_Dots$Plus = {ctor: 'Plus'};
var _user$project$Internal_Dots$Cross = {ctor: 'Cross'};
var _user$project$Internal_Dots$Diamond = {ctor: 'Diamond'};
var _user$project$Internal_Dots$Square = {ctor: 'Square'};
var _user$project$Internal_Dots$Triangle = {ctor: 'Triangle'};
var _user$project$Internal_Dots$Circle = {ctor: 'Circle'};
var _user$project$Internal_Dots$None = {ctor: 'None'};

var _user$project$LineChart_Dots$aura = _user$project$Internal_Dots$aura;
var _user$project$LineChart_Dots$disconnected = _user$project$Internal_Dots$disconnected;
var _user$project$LineChart_Dots$empty = _user$project$Internal_Dots$empty;
var _user$project$LineChart_Dots$full = _user$project$Internal_Dots$full;
var _user$project$LineChart_Dots$hoverMany = function (hovered) {
	var styleIndividual = function (datum) {
		return A2(
			_elm_lang$core$List$any,
			F2(
				function (x, y) {
					return _elm_lang$core$Native_Utils.eq(x, y);
				})(datum),
			hovered) ? A3(_user$project$LineChart_Dots$aura, 7, 6, 0.3) : A2(_user$project$LineChart_Dots$disconnected, 10, 2);
	};
	var styleLegend = function (_p0) {
		return A2(_user$project$LineChart_Dots$disconnected, 10, 2);
	};
	return _user$project$Internal_Dots$customAny(
		{legend: styleLegend, individual: styleIndividual});
};
var _user$project$LineChart_Dots$hoverOne = function (maybeHovered) {
	var styleIndividual = function (datum) {
		return _elm_lang$core$Native_Utils.eq(
			_elm_lang$core$Maybe$Just(datum),
			maybeHovered) ? A3(_user$project$LineChart_Dots$aura, 7, 6, 0.3) : A2(_user$project$LineChart_Dots$disconnected, 10, 2);
	};
	var styleLegend = function (_p1) {
		return A2(_user$project$LineChart_Dots$disconnected, 10, 2);
	};
	return _user$project$Internal_Dots$customAny(
		{legend: styleLegend, individual: styleIndividual});
};
var _user$project$LineChart_Dots$customAny = _user$project$Internal_Dots$customAny;
var _user$project$LineChart_Dots$custom = _user$project$Internal_Dots$custom;
var _user$project$LineChart_Dots$default = _user$project$Internal_Dots$default;
var _user$project$LineChart_Dots$cross = _user$project$Internal_Dots$Cross;
var _user$project$LineChart_Dots$plus = _user$project$Internal_Dots$Plus;
var _user$project$LineChart_Dots$diamond = _user$project$Internal_Dots$Diamond;
var _user$project$LineChart_Dots$square = _user$project$Internal_Dots$Square;
var _user$project$LineChart_Dots$triangle = _user$project$Internal_Dots$Triangle;
var _user$project$LineChart_Dots$circle = _user$project$Internal_Dots$Circle;
var _user$project$LineChart_Dots$none = _user$project$Internal_Dots$None;

var _user$project$Internal_Grid$viewLines = F5(
	function (system, verticals, horizontals, width, color) {
		var attributes = {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
				_elm_lang$core$Basics$toString(width)),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$stroke(
					_eskimoblood$elm_color_extra$Color_Convert$colorToHex(color)),
				_1: {ctor: '[]'}
			}
		};
		return A2(
			_elm_lang$core$Basics_ops['++'],
			A2(
				_elm_lang$core$List$map,
				A2(_user$project$Internal_Svg$horizontalGrid, system, attributes),
				horizontals),
			A2(
				_elm_lang$core$List$map,
				A2(_user$project$Internal_Svg$verticalGrid, system, attributes),
				verticals));
	});
var _user$project$Internal_Grid$viewDots = F5(
	function (system, verticals, horizontals, radius, color) {
		var dot = F2(
			function (x, y) {
				return A2(
					_user$project$LineChart_Coordinate$toSvg,
					system,
					A2(_user$project$LineChart_Coordinate$Point, x, y));
			});
		var dots_ = function (g) {
			return A2(
				_elm_lang$core$List$map,
				dot(g),
				horizontals);
		};
		var dots = A2(_elm_lang$core$List$concatMap, dots_, verticals);
		return A2(
			_elm_lang$core$List$map,
			A2(_user$project$Internal_Svg$gridDot, radius, color),
			dots);
	});
var _user$project$Internal_Grid$view = F4(
	function (system, xAxis, yAxis, grid) {
		var hasGrid = function (tick) {
			return tick.grid ? _elm_lang$core$Maybe$Just(tick.position) : _elm_lang$core$Maybe$Nothing;
		};
		var horizontals = A2(
			_elm_lang$core$List$filterMap,
			hasGrid,
			A3(
				_user$project$Internal_Axis_Ticks$ticks,
				system.yData,
				system.y,
				_user$project$Internal_Axis$ticks(yAxis)));
		var verticals = A2(
			_elm_lang$core$List$filterMap,
			hasGrid,
			A3(
				_user$project$Internal_Axis_Ticks$ticks,
				system.xData,
				system.x,
				_user$project$Internal_Axis$ticks(xAxis)));
		var _p0 = grid;
		if (_p0.ctor === 'Dots') {
			return A5(_user$project$Internal_Grid$viewDots, system, verticals, horizontals, _p0._0, _p0._1);
		} else {
			return A5(_user$project$Internal_Grid$viewLines, system, verticals, horizontals, _p0._0, _p0._1);
		}
	});
var _user$project$Internal_Grid$Lines = F2(
	function (a, b) {
		return {ctor: 'Lines', _0: a, _1: b};
	});
var _user$project$Internal_Grid$lines = _user$project$Internal_Grid$Lines;
var _user$project$Internal_Grid$default = A2(_user$project$Internal_Grid$lines, 1, _user$project$LineChart_Colors$grayLightest);
var _user$project$Internal_Grid$Dots = F2(
	function (a, b) {
		return {ctor: 'Dots', _0: a, _1: b};
	});
var _user$project$Internal_Grid$dots = _user$project$Internal_Grid$Dots;

var _user$project$LineChart_Grid$lines = _user$project$Internal_Grid$lines;
var _user$project$LineChart_Grid$dots = _user$project$Internal_Grid$dots;
var _user$project$LineChart_Grid$default = _user$project$Internal_Grid$default;

var _user$project$Internal_Interpolation$after = F2(
	function (a, b) {
		return {
			ctor: '::',
			_0: a,
			_1: {
				ctor: '::',
				_0: A2(_user$project$Internal_Data$Point, b.x, a.y),
				_1: {
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				}
			}
		};
	});
var _user$project$Internal_Interpolation$fakeLast = F2(
	function (last0, last1) {
		return A2(_user$project$Internal_Data$Point, (last1.x + last1.x) - last0.x, last1.y);
	});
var _user$project$Internal_Interpolation$stepped = function (sections) {
	var expand = F2(
		function (result, section) {
			expand:
			while (true) {
				var _p0 = section;
				if (_p0._0.ctor === '::') {
					if (_p0._0._1.ctor === '::') {
						var _p1 = _p0._0._1._0;
						var _v1 = A2(
							_elm_lang$core$Basics_ops['++'],
							result,
							A2(_user$project$Internal_Interpolation$after, _p0._0._0, _p1)),
							_v2 = {
							ctor: '_Tuple2',
							_0: {ctor: '::', _0: _p1, _1: _p0._0._1._1},
							_1: _p0._1
						};
						result = _v1;
						section = _v2;
						continue expand;
					} else {
						if (_p0._1.ctor === 'Just') {
							return A2(
								_elm_lang$core$Basics_ops['++'],
								result,
								{
									ctor: '::',
									_0: A2(_user$project$Internal_Data$Point, _p0._1._0.x, _p0._0._0.y),
									_1: {ctor: '[]'}
								});
						} else {
							return result;
						}
					}
				} else {
					return result;
				}
			}
		});
	return A2(
		_elm_lang$core$List$map,
		function (_p2) {
			return A2(
				_elm_lang$core$List$map,
				_user$project$Internal_Path$Line,
				A2(
					expand,
					{ctor: '[]'},
					_p2));
		},
		sections);
};
var _user$project$Internal_Interpolation$sign = function (x) {
	return (_elm_lang$core$Native_Utils.cmp(x, 0) < 0) ? -1 : 1;
};
var _user$project$Internal_Interpolation$slope2 = F3(
	function (point0, point1, t) {
		var h = point1.x - point0.x;
		return (!_elm_lang$core$Native_Utils.eq(h, 0)) ? ((((3 * (point1.y - point0.y)) / h) - t) / 2) : t;
	});
var _user$project$Internal_Interpolation$toH = F2(
	function (h0, h1) {
		return _elm_lang$core$Native_Utils.eq(h0, 0) ? ((_elm_lang$core$Native_Utils.cmp(h1, 0) < 0) ? (0 * -1) : h1) : h0;
	});
var _user$project$Internal_Interpolation$slope3 = F3(
	function (point0, point1, point2) {
		var h1 = point2.x - point1.x;
		var h0 = point1.x - point0.x;
		var s0h = A2(_user$project$Internal_Interpolation$toH, h0, h1);
		var s0 = (point1.y - point0.y) / s0h;
		var s1h = A2(_user$project$Internal_Interpolation$toH, h1, h0);
		var s1 = (point2.y - point1.y) / s1h;
		var p = ((s0 * h1) + (s1 * h0)) / (h0 + h1);
		var slope = (_user$project$Internal_Interpolation$sign(s0) + _user$project$Internal_Interpolation$sign(s1)) * A2(
			_elm_lang$core$Basics$min,
			A2(
				_elm_lang$core$Basics$min,
				_elm_lang$core$Basics$abs(s0),
				_elm_lang$core$Basics$abs(s1)),
			0.5 * _elm_lang$core$Basics$abs(p));
		return _elm_lang$core$Basics$isNaN(slope) ? 0 : slope;
	});
var _user$project$Internal_Interpolation$monotoneCurve = F4(
	function (point0, point1, tangent0, tangent1) {
		var dx = (point1.x - point0.x) / 3;
		return A3(
			_user$project$Internal_Path$CubicBeziers,
			{x: point0.x + dx, y: point0.y + (dx * tangent0)},
			{x: point1.x - dx, y: point1.y - (dx * tangent1)},
			point1);
	});
var _user$project$Internal_Interpolation$linear = _elm_lang$core$List$map(
	_elm_lang$core$List$map(_user$project$Internal_Path$Line));
var _user$project$Internal_Interpolation$Stepped = {ctor: 'Stepped'};
var _user$project$Internal_Interpolation$Monotone = {ctor: 'Monotone'};
var _user$project$Internal_Interpolation$Linear = {ctor: 'Linear'};
var _user$project$Internal_Interpolation$Previous = function (a) {
	return {ctor: 'Previous', _0: a};
};
var _user$project$Internal_Interpolation$monotonePart = F2(
	function (points, _p3) {
		monotonePart:
		while (true) {
			var _p4 = _p3;
			var _p17 = _p4._0;
			var _p16 = _p4._1;
			var _p5 = {ctor: '_Tuple2', _0: _p17, _1: points};
			_v4_4:
			do {
				if (_p5._0.ctor === 'First') {
					if ((_p5._1.ctor === '::') && (_p5._1._1.ctor === '::')) {
						if (_p5._1._1._1.ctor === '::') {
							var _p8 = _p5._1._1._1._0;
							var _p7 = _p5._1._1._0;
							var _p6 = _p5._1._0;
							var t1 = A3(_user$project$Internal_Interpolation$slope3, _p6, _p7, _p8);
							var t0 = A3(_user$project$Internal_Interpolation$slope2, _p6, _p7, t1);
							var _v5 = {
								ctor: '::',
								_0: _p7,
								_1: {ctor: '::', _0: _p8, _1: _p5._1._1._1._1}
							},
								_v6 = {
								ctor: '_Tuple2',
								_0: _user$project$Internal_Interpolation$Previous(t1),
								_1: A2(
									_elm_lang$core$Basics_ops['++'],
									_p16,
									{
										ctor: '::',
										_0: A4(_user$project$Internal_Interpolation$monotoneCurve, _p6, _p7, t0, t1),
										_1: {ctor: '[]'}
									})
							};
							points = _v5;
							_p3 = _v6;
							continue monotonePart;
						} else {
							var _p13 = _p5._1._1._0;
							var _p12 = _p5._1._0;
							var t1 = A3(_user$project$Internal_Interpolation$slope3, _p12, _p13, _p13);
							return {
								ctor: '_Tuple2',
								_0: _user$project$Internal_Interpolation$Previous(t1),
								_1: A2(
									_elm_lang$core$Basics_ops['++'],
									_p16,
									{
										ctor: '::',
										_0: A4(_user$project$Internal_Interpolation$monotoneCurve, _p12, _p13, t1, t1),
										_1: {
											ctor: '::',
											_0: _user$project$Internal_Path$Line(_p13),
											_1: {ctor: '[]'}
										}
									})
							};
						}
					} else {
						break _v4_4;
					}
				} else {
					if ((_p5._1.ctor === '::') && (_p5._1._1.ctor === '::')) {
						if (_p5._1._1._1.ctor === '::') {
							var _p11 = _p5._1._1._1._0;
							var _p10 = _p5._1._1._0;
							var _p9 = _p5._1._0;
							var t1 = A3(_user$project$Internal_Interpolation$slope3, _p9, _p10, _p11);
							var _v7 = {
								ctor: '::',
								_0: _p10,
								_1: {ctor: '::', _0: _p11, _1: _p5._1._1._1._1}
							},
								_v8 = {
								ctor: '_Tuple2',
								_0: _user$project$Internal_Interpolation$Previous(t1),
								_1: A2(
									_elm_lang$core$Basics_ops['++'],
									_p16,
									{
										ctor: '::',
										_0: A4(_user$project$Internal_Interpolation$monotoneCurve, _p9, _p10, _p5._0._0, t1),
										_1: {ctor: '[]'}
									})
							};
							points = _v7;
							_p3 = _v8;
							continue monotonePart;
						} else {
							var _p15 = _p5._1._1._0;
							var _p14 = _p5._1._0;
							var t1 = A3(_user$project$Internal_Interpolation$slope3, _p14, _p15, _p15);
							return {
								ctor: '_Tuple2',
								_0: _user$project$Internal_Interpolation$Previous(t1),
								_1: A2(
									_elm_lang$core$Basics_ops['++'],
									_p16,
									{
										ctor: '::',
										_0: A4(_user$project$Internal_Interpolation$monotoneCurve, _p14, _p15, _p5._0._0, t1),
										_1: {
											ctor: '::',
											_0: _user$project$Internal_Path$Line(_p15),
											_1: {ctor: '[]'}
										}
									})
							};
						}
					} else {
						break _v4_4;
					}
				}
			} while(false);
			return {ctor: '_Tuple2', _0: _p17, _1: _p16};
		}
	});
var _user$project$Internal_Interpolation$monotoneSection = F2(
	function (points, _p18) {
		var _p19 = _p18;
		var _p23 = _p19._0;
		var _p20 = function () {
			var _p21 = points;
			if (_p21.ctor === '::') {
				var _p22 = _p21._0;
				return A2(
					_user$project$Internal_Interpolation$monotonePart,
					{ctor: '::', _0: _p22, _1: _p21._1},
					{
						ctor: '_Tuple2',
						_0: _p23,
						_1: {
							ctor: '::',
							_0: _user$project$Internal_Path$Line(_p22),
							_1: {ctor: '[]'}
						}
					});
			} else {
				return {
					ctor: '_Tuple2',
					_0: _p23,
					_1: {ctor: '[]'}
				};
			}
		}();
		var t0 = _p20._0;
		var commands = _p20._1;
		return {
			ctor: '_Tuple2',
			_0: t0,
			_1: {ctor: '::', _0: commands, _1: _p19._1}
		};
	});
var _user$project$Internal_Interpolation$First = {ctor: 'First'};
var _user$project$Internal_Interpolation$monotone = function (sections) {
	return _elm_lang$core$Tuple$second(
		A3(
			_elm_lang$core$List$foldr,
			_user$project$Internal_Interpolation$monotoneSection,
			{
				ctor: '_Tuple2',
				_0: _user$project$Internal_Interpolation$First,
				_1: {ctor: '[]'}
			},
			sections));
};
var _user$project$Internal_Interpolation$toCommands = F2(
	function (interpolation, data) {
		var pointsSections = _elm_lang$core$List$map(
			function (_p24) {
				return A2(
					_elm_lang$core$Tuple$mapSecond,
					_elm_lang$core$Maybe$map(
						function (_) {
							return _.point;
						}),
					A2(
						_elm_lang$core$Tuple$mapFirst,
						_elm_lang$core$List$map(
							function (_) {
								return _.point;
							}),
						_p24));
			});
		var points = _elm_lang$core$List$map(
			function (_p25) {
				return A2(
					_elm_lang$core$List$map,
					function (_) {
						return _.point;
					},
					_elm_lang$core$Tuple$first(_p25));
			});
		var _p26 = interpolation;
		switch (_p26.ctor) {
			case 'Linear':
				return _user$project$Internal_Interpolation$linear(
					points(data));
			case 'Monotone':
				return _user$project$Internal_Interpolation$monotone(
					points(data));
			default:
				return _user$project$Internal_Interpolation$stepped(
					pointsSections(data));
		}
	});

var _user$project$Internal_Line$toAreaAttributes = F3(
	function (_p1, _p0, area) {
		var _p2 = _p1;
		var _p3 = _p0;
		return {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$class('chart__interpolation__area__fragment'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$fill(
					_eskimoblood$elm_color_extra$Color_Convert$colorToHex(
						_p3._0.color(_p2._0.color))),
				_1: {ctor: '[]'}
			}
		};
	});
var _user$project$Internal_Line$viewArea = F5(
	function (_p4, line, style, interpolation, data) {
		var _p5 = _p4;
		var _p7 = _p5.system;
		var _p6 = _p5.area;
		var attributes = {
			ctor: '::',
			_0: _user$project$LineChart_Junk$withinChartArea(_p7),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$fillOpacity(
					_elm_lang$core$Basics$toString(
						_user$project$Internal_Area$opacitySingle(_p6))),
				_1: A3(_user$project$Internal_Line$toAreaAttributes, line, style, _p6)
			}
		};
		var ground = function (point) {
			return A2(
				_user$project$Internal_Data$Point,
				point.x,
				_user$project$Internal_Utils$towardsZero(_p7.y));
		};
		var commands = F3(
			function (first, middle, last) {
				return A3(
					_user$project$Internal_Utils$concat,
					{
						ctor: '::',
						_0: _user$project$Internal_Path$Move(
							ground(
								_user$project$Internal_Path$toPoint(first))),
						_1: {
							ctor: '::',
							_0: _user$project$Internal_Path$Line(
								_user$project$Internal_Path$toPoint(first)),
							_1: {ctor: '[]'}
						}
					},
					interpolation,
					{
						ctor: '::',
						_0: _user$project$Internal_Path$Line(
							ground(
								_user$project$Internal_Path$toPoint(last))),
						_1: {ctor: '[]'}
					});
			});
		return A2(
			_user$project$Internal_Utils$viewWithEdges,
			interpolation,
			F3(
				function (first, middle, last) {
					return A3(
						_user$project$Internal_Path$view,
						_p7,
						attributes,
						A3(commands, first, middle, last));
				}));
	});
var _user$project$Internal_Line$toSeriesAttributes = F2(
	function (_p9, _p8) {
		var _p10 = _p9;
		var _p11 = _p8;
		var _p12 = _p11._0;
		return {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$style('pointer-events: none;'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$class('chart__interpolation__line__fragment'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$stroke(
						_eskimoblood$elm_color_extra$Color_Convert$colorToHex(
							_p12.color(_p10._0.color))),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
							_elm_lang$core$Basics$toString(_p12.width)),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$strokeDasharray(
								A2(
									_elm_lang$core$String$join,
									' ',
									A2(_elm_lang$core$List$map, _elm_lang$core$Basics$toString, _p10._0.dashing))),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		};
	});
var _user$project$Internal_Line$viewSample = F5(
	function (_p13, line, area, data, sampleWidth) {
		var _p14 = _p13;
		var rectangleAttributes = {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$x('0'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$y('0'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height('9'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$width(
							_elm_lang$core$Basics$toString(sampleWidth)),
						_1: {ctor: '[]'}
					}
				}
			}
		};
		var sizeAttributes = {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$x1('0'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$y1('0'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$x2(
						_elm_lang$core$Basics$toString(sampleWidth)),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$y2('0'),
						_1: {ctor: '[]'}
					}
				}
			}
		};
		var style = _p14._0(
			A2(
				_elm_lang$core$List$map,
				function (_) {
					return _.user;
				},
				data));
		var lineAttributes = A2(_user$project$Internal_Line$toSeriesAttributes, line, style);
		var areaAttributes = {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$fillOpacity(
				_elm_lang$core$Basics$toString(
					_user$project$Internal_Area$opacity(area))),
			_1: A3(_user$project$Internal_Line$toAreaAttributes, line, style, area)
		};
		var viewRectangle = function (_p15) {
			var _p16 = _p15;
			return A2(
				_elm_lang$svg$Svg$rect,
				A2(_elm_lang$core$Basics_ops['++'], areaAttributes, rectangleAttributes),
				{ctor: '[]'});
		};
		return A2(
			_elm_lang$svg$Svg$g,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$line,
					A2(_elm_lang$core$Basics_ops['++'], lineAttributes, sizeAttributes),
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Internal_Utils$viewIf,
						_user$project$Internal_Area$hasArea(area),
						viewRectangle),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Internal_Line$viewSeries = F5(
	function (_p17, line, style, interpolation, data) {
		var _p18 = _p17;
		var _p20 = _p18.system;
		var attributes = {
			ctor: '::',
			_0: _user$project$LineChart_Junk$withinChartArea(_p20),
			_1: A2(_user$project$Internal_Line$toSeriesAttributes, line, style)
		};
		return A2(
			_user$project$Internal_Utils$viewWithFirst,
			data,
			F2(
				function (first, _p19) {
					return A3(
						_user$project$Internal_Path$view,
						_p20,
						attributes,
						{
							ctor: '::',
							_0: _user$project$Internal_Path$Move(first.point),
							_1: interpolation
						});
				}));
	});
var _user$project$Internal_Line$viewDot = F3(
	function ($arguments, _p22, _p21) {
		var _p23 = _p22;
		var _p25 = _p23._0;
		var _p24 = _p21;
		return _user$project$Internal_Dots$view(
			{
				system: $arguments.system,
				dotsConfig: $arguments.dotsConfig,
				shape: _p25.shape,
				color: _p24._0.color(_p25.color)
			});
	});
var _user$project$Internal_Line$viewSingle = F3(
	function ($arguments, line, data) {
		var style = function (_p26) {
			var _p27 = _p26;
			return _p27._0(
				A2(
					_elm_lang$core$List$map,
					function (_) {
						return _.user;
					},
					data));
		}($arguments.lineConfig);
		var sections = A4(
			_user$project$Internal_Utils$part,
			function (_) {
				return _.isReal;
			},
			data,
			{ctor: '[]'},
			{ctor: '[]'});
		var parts = A2(_elm_lang$core$List$map, _elm_lang$core$Tuple$first, sections);
		var viewDots = A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$class('chart__dots'),
				_1: {ctor: '[]'}
			},
			A2(
				_elm_lang$core$List$map,
				A3(_user$project$Internal_Line$viewDot, $arguments, line, style),
				A2(
					_elm_lang$core$List$filter,
					function (_p28) {
						return A2(
							_user$project$Internal_Data$isWithinRange,
							$arguments.system,
							function (_) {
								return _.point;
							}(_p28));
					},
					_elm_lang$core$List$concat(parts))));
		var commands = A2(_user$project$Internal_Interpolation$toCommands, $arguments.interpolation, sections);
		var viewAreas = function (_p29) {
			var _p30 = _p29;
			return A2(
				_elm_lang$svg$Svg$g,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$class('chart__interpolation__area'),
					_1: {ctor: '[]'}
				},
				A3(
					_elm_lang$core$List$map2,
					A3(_user$project$Internal_Line$viewArea, $arguments, line, style),
					commands,
					parts));
		};
		var viewSeriess = A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$class('chart__interpolation__line'),
				_1: {ctor: '[]'}
			},
			A3(
				_elm_lang$core$List$map2,
				A3(_user$project$Internal_Line$viewSeries, $arguments, line, style),
				commands,
				parts));
		return {
			ctor: '_Tuple3',
			_0: A2(
				_user$project$Internal_Utils$viewIf,
				_user$project$Internal_Area$hasArea($arguments.area),
				viewAreas),
			_1: viewSeriess,
			_2: viewDots
		};
	});
var _user$project$Internal_Line$viewStacked = F2(
	function (area, _p31) {
		var _p32 = _p31;
		var toList = F2(
			function (l, d) {
				return {
					ctor: '::',
					_0: l,
					_1: {
						ctor: '::',
						_0: d,
						_1: {ctor: '[]'}
					}
				};
			});
		var bottoms = _elm_lang$core$List$concat(
			A3(_elm_lang$core$List$map2, toList, _p32._1, _p32._2));
		var opacity = A2(
			_elm_lang$core$Basics_ops['++'],
			'opacity: ',
			_elm_lang$core$Basics$toString(
				_user$project$Internal_Area$opacityContainer(area)));
		return {
			ctor: '::',
			_0: A2(
				_elm_lang$svg$Svg$g,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$class('chart__bottoms'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$style(opacity),
						_1: {ctor: '[]'}
					}
				},
				_p32._0),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$g,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$class('chart__tops'),
						_1: {ctor: '[]'}
					},
					bottoms),
				_1: {ctor: '[]'}
			}
		};
	});
var _user$project$Internal_Line$viewNormal = function (_p33) {
	var _p34 = _p33;
	var view = F3(
		function (area, line, dots) {
			return A2(
				_elm_lang$svg$Svg$g,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$class('chart__line'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: area,
					_1: {
						ctor: '::',
						_0: line,
						_1: {
							ctor: '::',
							_0: dots,
							_1: {ctor: '[]'}
						}
					}
				});
		});
	return A4(_elm_lang$core$List$map3, view, _p34._0, _p34._1, _p34._2);
};
var _user$project$Internal_Line$view = F3(
	function ($arguments, lines, datas) {
		var buildSeriesViews = (_elm_lang$core$Native_Utils.cmp(
			_user$project$Internal_Area$opacityContainer($arguments.area),
			1) < 0) ? _user$project$Internal_Line$viewStacked($arguments.area) : _user$project$Internal_Line$viewNormal;
		var container = _elm_lang$svg$Svg$g(
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$class('chart__lines'),
				_1: {ctor: '[]'}
			});
		return container(
			buildSeriesViews(
				_user$project$Internal_Utils$unzip3(
					A3(
						_elm_lang$core$List$map2,
						_user$project$Internal_Line$viewSingle($arguments),
						lines,
						datas))));
	});
var _user$project$Internal_Line$color = F3(
	function (_p36, _p35, data) {
		var _p37 = _p36;
		var _p38 = _p35;
		var _p39 = _p37._0(
			A2(
				_elm_lang$core$List$map,
				function (_) {
					return _.user;
				},
				data));
		var style = _p39._0;
		return style.color(_p38._0.color);
	});
var _user$project$Internal_Line$data = function (_p40) {
	var _p41 = _p40;
	return _p41._0.data;
};
var _user$project$Internal_Line$shape = function (_p42) {
	var _p43 = _p42;
	return _p43._0.shape;
};
var _user$project$Internal_Line$label = function (_p44) {
	var _p45 = _p44;
	return _p45._0.label;
};
var _user$project$Internal_Line$SeriesConfig = F5(
	function (a, b, c, d, e) {
		return {color: a, shape: b, dashing: c, label: d, data: e};
	});
var _user$project$Internal_Line$Arguments = F5(
	function (a, b, c, d, e) {
		return {system: a, dotsConfig: b, interpolation: c, lineConfig: d, area: e};
	});
var _user$project$Internal_Line$Series = function (a) {
	return {ctor: 'Series', _0: a};
};
var _user$project$Internal_Line$line = F4(
	function (color, shape, label, data) {
		return _user$project$Internal_Line$Series(
			A5(
				_user$project$Internal_Line$SeriesConfig,
				color,
				shape,
				{ctor: '[]'},
				label,
				data));
	});
var _user$project$Internal_Line$dash = F5(
	function (color, shape, label, dashing, data) {
		return _user$project$Internal_Line$Series(
			A5(_user$project$Internal_Line$SeriesConfig, color, shape, dashing, label, data));
	});
var _user$project$Internal_Line$Config = function (a) {
	return {ctor: 'Config', _0: a};
};
var _user$project$Internal_Line$custom = _user$project$Internal_Line$Config;
var _user$project$Internal_Line$Style = function (a) {
	return {ctor: 'Style', _0: a};
};
var _user$project$Internal_Line$style = F2(
	function (width, color) {
		return _user$project$Internal_Line$Style(
			{width: width, color: color});
	});
var _user$project$Internal_Line$default = _user$project$Internal_Line$Config(
	function (_p46) {
		return A2(_user$project$Internal_Line$style, 1, _elm_lang$core$Basics$identity);
	});
var _user$project$Internal_Line$wider = function (width) {
	return _user$project$Internal_Line$Config(
		function (_p47) {
			return A2(_user$project$Internal_Line$style, width, _elm_lang$core$Basics$identity);
		});
};

var _user$project$LineChart_Line$style = _user$project$Internal_Line$style;
var _user$project$LineChart_Line$custom = _user$project$Internal_Line$custom;
var _user$project$LineChart_Line$hoverOne = function (hovered) {
	return _user$project$LineChart_Line$custom(
		function (data) {
			return A2(
				_elm_lang$core$List$any,
				function (_p0) {
					return A2(
						F2(
							function (x, y) {
								return _elm_lang$core$Native_Utils.eq(x, y);
							}),
						hovered,
						_elm_lang$core$Maybe$Just(_p0));
				},
				data) ? A2(_user$project$LineChart_Line$style, 3, _elm_lang$core$Basics$identity) : A2(_user$project$LineChart_Line$style, 1, _elm_lang$core$Basics$identity);
		});
};
var _user$project$LineChart_Line$wider = _user$project$Internal_Line$wider;
var _user$project$LineChart_Line$default = _user$project$Internal_Line$default;

var _user$project$Internal_Events$position = _elm_lang$core$Json_Decode$oneOf(
	{
		ctor: '::',
		_0: _debois$elm_dom$DOM$boundingClientRect,
		_1: {
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$lazy(
				function (_p0) {
					return _debois$elm_dom$DOM$parentElement(_user$project$Internal_Events$position);
				}),
			_1: {ctor: '[]'}
		}
	});
var _user$project$Internal_Events$toJsonDecoder = F3(
	function (data, system, _p1) {
		var _p2 = _p1;
		var handle = F3(
			function (mouseX, mouseY, _p3) {
				var _p4 = _p3;
				var _p6 = _p4.width;
				var _p5 = _p4.height;
				var y = mouseY - _p4.top;
				var x = mouseX - _p4.left;
				var newSize = {width: _p6, height: _p5};
				var heightPercent = _p5 / system.frame.size.height;
				var widthPercent = _p6 / system.frame.size.width;
				var newMargin = {top: system.frame.margin.top * heightPercent, right: system.frame.margin.right * widthPercent, bottom: system.frame.margin.bottom * heightPercent, left: system.frame.margin.left * widthPercent};
				var newSystem = _elm_lang$core$Native_Utils.update(
					system,
					{
						frame: {size: newSize, margin: newMargin}
					});
				return A3(
					_p2._0,
					data,
					newSystem,
					A2(_user$project$LineChart_Coordinate$Point, x, y));
			});
		return A4(
			_elm_lang$core$Json_Decode$map3,
			handle,
			A2(_elm_lang$core$Json_Decode$field, 'pageX', _elm_lang$core$Json_Decode$float),
			A2(_elm_lang$core$Json_Decode$field, 'pageY', _elm_lang$core$Json_Decode$float),
			_debois$elm_dom$DOM$target(_user$project$Internal_Events$position));
	});
var _user$project$Internal_Events$distanceY = F3(
	function (system, searched, dot) {
		return _elm_lang$core$Basics$abs(
			A2(_user$project$LineChart_Coordinate$toSvgY, system, dot.y) - A2(_user$project$LineChart_Coordinate$toSvgY, system, searched.y));
	});
var _user$project$Internal_Events$distanceX = F3(
	function (system, searched, dot) {
		return _elm_lang$core$Basics$abs(
			A2(_user$project$LineChart_Coordinate$toSvgX, system, dot.x) - A2(_user$project$LineChart_Coordinate$toSvgX, system, searched.x));
	});
var _user$project$Internal_Events$distance = F3(
	function (system, searched, dot) {
		return _elm_lang$core$Basics$sqrt(
			Math.pow(
				A3(_user$project$Internal_Events$distanceX, system, searched, dot),
				2) + Math.pow(
				A3(_user$project$Internal_Events$distanceY, system, searched, dot),
				2));
	});
var _user$project$Internal_Events$withinRadius = F4(
	function (system, radius, searched, dot) {
		return _elm_lang$core$Native_Utils.cmp(
			A3(_user$project$Internal_Events$distance, system, searched, dot),
			radius) < 1;
	});
var _user$project$Internal_Events$withinRadiusX = F4(
	function (system, radius, searched, dot) {
		return _elm_lang$core$Native_Utils.cmp(
			A3(_user$project$Internal_Events$distanceX, system, searched, dot),
			radius) < 1;
	});
var _user$project$Internal_Events$getNearestXHelp = F3(
	function (points, system, searched) {
		var distanceX_ = A2(_user$project$Internal_Events$distanceX, system, searched);
		var getClosest = F2(
			function (point, allClosest) {
				var _p7 = _elm_lang$core$List$head(allClosest);
				if (_p7.ctor === 'Just') {
					var _p8 = _p7._0;
					return _elm_lang$core$Native_Utils.eq(_p8.point.x, point.point.x) ? {ctor: '::', _0: point, _1: allClosest} : ((_elm_lang$core$Native_Utils.cmp(
						distanceX_(_p8.point),
						distanceX_(point.point)) > 0) ? {
						ctor: '::',
						_0: point,
						_1: {ctor: '[]'}
					} : allClosest);
				} else {
					return {
						ctor: '::',
						_0: point,
						_1: {ctor: '[]'}
					};
				}
			});
		return A3(
			_elm_lang$core$List$foldl,
			getClosest,
			{ctor: '[]'},
			points);
	});
var _user$project$Internal_Events$getNearestHelp = F3(
	function (points, system, searched) {
		var distance_ = A2(_user$project$Internal_Events$distance, system, searched);
		var getClosest = F2(
			function (point, closest) {
				return (_elm_lang$core$Native_Utils.cmp(
					distance_(closest.point),
					distance_(point.point)) < 0) ? closest : point;
			});
		return A2(
			_user$project$Internal_Utils$withFirst,
			A2(
				_elm_lang$core$List$filter,
				function (_) {
					return _.isReal;
				},
				points),
			_elm_lang$core$List$foldl(getClosest));
	});
var _user$project$Internal_Events$toContainerAttributes = F3(
	function (data, system, _p9) {
		var _p10 = _p9;
		var order = function (_p11) {
			var _p12 = _p11;
			return _p12._0 ? _elm_lang$core$Maybe$Just(
				A2(_p12._1, data, system)) : _elm_lang$core$Maybe$Nothing;
		};
		return A2(_elm_lang$core$List$filterMap, order, _p10._0);
	});
var _user$project$Internal_Events$toChartAttributes = F3(
	function (data, system, _p13) {
		var _p14 = _p13;
		var order = function (_p15) {
			var _p16 = _p15;
			return _p16._0 ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
				A2(_p16._1, data, system));
		};
		return A2(_elm_lang$core$List$filterMap, order, _p14._0);
	});
var _user$project$Internal_Events$Options = F3(
	function (a, b, c) {
		return {stopPropagation: a, preventDefault: b, catchOutsideChart: c};
	});
var _user$project$Internal_Events$Config = function (a) {
	return {ctor: 'Config', _0: a};
};
var _user$project$Internal_Events$custom = _user$project$Internal_Events$Config;
var _user$project$Internal_Events$default = _user$project$Internal_Events$custom(
	{ctor: '[]'});
var _user$project$Internal_Events$Event = F2(
	function (a, b) {
		return {ctor: 'Event', _0: a, _1: b};
	});
var _user$project$Internal_Events$onMouseLeave = function (msg) {
	return A2(
		_user$project$Internal_Events$Event,
		false,
		F2(
			function (_p18, _p17) {
				return A2(
					_elm_lang$svg$Svg_Events$on,
					'mouseleave',
					_elm_lang$core$Json_Decode$succeed(msg));
			}));
};
var _user$project$Internal_Events$Decoder = function (a) {
	return {ctor: 'Decoder', _0: a};
};
var _user$project$Internal_Events$getSvg = _user$project$Internal_Events$Decoder(
	F3(
		function (points, system, searched) {
			return searched;
		}));
var _user$project$Internal_Events$getData = _user$project$Internal_Events$Decoder(
	F3(
		function (points, system, searchedSvg) {
			return A2(_user$project$LineChart_Coordinate$toData, system, searchedSvg);
		}));
var _user$project$Internal_Events$getNearest = _user$project$Internal_Events$Decoder(
	F3(
		function (points, system, searchedSvg) {
			var searched = A2(_user$project$LineChart_Coordinate$toData, system, searchedSvg);
			return A2(
				_elm_lang$core$Maybe$map,
				function (_) {
					return _.user;
				},
				A3(_user$project$Internal_Events$getNearestHelp, points, system, searched));
		}));
var _user$project$Internal_Events$getWithin = function (radius) {
	return _user$project$Internal_Events$Decoder(
		F3(
			function (points, system, searchedSvg) {
				var searched = A2(_user$project$LineChart_Coordinate$toData, system, searchedSvg);
				var keepIfEligible = function (closest) {
					return A4(_user$project$Internal_Events$withinRadius, system, radius, searched, closest.point) ? _elm_lang$core$Maybe$Just(closest.user) : _elm_lang$core$Maybe$Nothing;
				};
				return A2(
					_elm_lang$core$Maybe$andThen,
					keepIfEligible,
					A3(_user$project$Internal_Events$getNearestHelp, points, system, searched));
			}));
};
var _user$project$Internal_Events$getNearestX = _user$project$Internal_Events$Decoder(
	F3(
		function (points, system, searchedSvg) {
			var searched = A2(_user$project$LineChart_Coordinate$toData, system, searchedSvg);
			return A2(
				_elm_lang$core$List$map,
				function (_) {
					return _.user;
				},
				A3(_user$project$Internal_Events$getNearestXHelp, points, system, searched));
		}));
var _user$project$Internal_Events$getWithinX = function (radius) {
	return _user$project$Internal_Events$Decoder(
		F3(
			function (points, system, searchedSvg) {
				var searched = A2(_user$project$LineChart_Coordinate$toData, system, searchedSvg);
				var keepIfEligible = function (_p19) {
					return A4(
						_user$project$Internal_Events$withinRadiusX,
						system,
						radius,
						searched,
						function (_) {
							return _.point;
						}(_p19));
				};
				return A2(
					_elm_lang$core$List$map,
					function (_) {
						return _.user;
					},
					A2(
						_elm_lang$core$List$filter,
						keepIfEligible,
						A3(_user$project$Internal_Events$getNearestXHelp, points, system, searched)));
			}));
};
var _user$project$Internal_Events$map = F2(
	function (f, _p20) {
		var _p21 = _p20;
		return _user$project$Internal_Events$Decoder(
			F3(
				function (ps, s, p) {
					return f(
						A3(_p21._0, ps, s, p));
				}));
	});
var _user$project$Internal_Events$on = F3(
	function (event, toMsg, decoder) {
		return A2(
			_user$project$Internal_Events$Event,
			false,
			F2(
				function (data, system) {
					return A2(
						_elm_lang$svg$Svg_Events$on,
						event,
						A3(
							_user$project$Internal_Events$toJsonDecoder,
							data,
							system,
							A2(_user$project$Internal_Events$map, toMsg, decoder)));
				}));
	});
var _user$project$Internal_Events$onClick = _user$project$Internal_Events$on('click');
var _user$project$Internal_Events$click = function (msg) {
	return _user$project$Internal_Events$custom(
		{
			ctor: '::',
			_0: A2(
				_user$project$Internal_Events$onClick,
				msg,
				_user$project$Internal_Events$getWithin(30)),
			_1: {ctor: '[]'}
		});
};
var _user$project$Internal_Events$onMouseMove = _user$project$Internal_Events$on('mousemove');
var _user$project$Internal_Events$hoverMany = function (msg) {
	return _user$project$Internal_Events$custom(
		{
			ctor: '::',
			_0: A2(_user$project$Internal_Events$onMouseMove, msg, _user$project$Internal_Events$getNearestX),
			_1: {
				ctor: '::',
				_0: _user$project$Internal_Events$onMouseLeave(
					msg(
						{ctor: '[]'})),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Internal_Events$hoverOne = function (msg) {
	return _user$project$Internal_Events$custom(
		{
			ctor: '::',
			_0: A2(
				_user$project$Internal_Events$onMouseMove,
				msg,
				_user$project$Internal_Events$getWithin(30)),
			_1: {
				ctor: '::',
				_0: A3(
					_user$project$Internal_Events$on,
					'touchstart',
					msg,
					_user$project$Internal_Events$getWithin(100)),
				_1: {
					ctor: '::',
					_0: A3(
						_user$project$Internal_Events$on,
						'touchmove',
						msg,
						_user$project$Internal_Events$getWithin(100)),
					_1: {
						ctor: '::',
						_0: _user$project$Internal_Events$onMouseLeave(
							msg(_elm_lang$core$Maybe$Nothing)),
						_1: {ctor: '[]'}
					}
				}
			}
		});
};
var _user$project$Internal_Events$onMouseDown = _user$project$Internal_Events$on('mousedown');
var _user$project$Internal_Events$onMouseUp = _user$project$Internal_Events$on('mouseup');
var _user$project$Internal_Events$onWithOptions = F4(
	function (event, options, toMsg, decoder) {
		return A2(
			_user$project$Internal_Events$Event,
			options.catchOutsideChart,
			F2(
				function (data, system) {
					return A3(
						_elm_lang$html$Html_Events$onWithOptions,
						event,
						A2(_elm_lang$html$Html_Events$Options, options.stopPropagation, options.preventDefault),
						A3(
							_user$project$Internal_Events$toJsonDecoder,
							data,
							system,
							A2(_user$project$Internal_Events$map, toMsg, decoder)));
				}));
	});
var _user$project$Internal_Events$map2 = F3(
	function (f, _p23, _p22) {
		var _p24 = _p23;
		var _p25 = _p22;
		return _user$project$Internal_Events$Decoder(
			F3(
				function (ps, s, p) {
					return A2(
						f,
						A3(_p24._0, ps, s, p),
						A3(_p25._0, ps, s, p));
				}));
	});
var _user$project$Internal_Events$map3 = F4(
	function (f, _p28, _p27, _p26) {
		var _p29 = _p28;
		var _p30 = _p27;
		var _p31 = _p26;
		return _user$project$Internal_Events$Decoder(
			F3(
				function (ps, s, p) {
					return A3(
						f,
						A3(_p29._0, ps, s, p),
						A3(_p30._0, ps, s, p),
						A3(_p31._0, ps, s, p));
				}));
	});

var _user$project$LineChart_Events$map3 = _user$project$Internal_Events$map3;
var _user$project$LineChart_Events$map2 = _user$project$Internal_Events$map2;
var _user$project$LineChart_Events$map = _user$project$Internal_Events$map;
var _user$project$LineChart_Events$getWithinX = _user$project$Internal_Events$getWithinX;
var _user$project$LineChart_Events$getNearestX = _user$project$Internal_Events$getNearestX;
var _user$project$LineChart_Events$getWithin = _user$project$Internal_Events$getWithin;
var _user$project$LineChart_Events$getNearest = _user$project$Internal_Events$getNearest;
var _user$project$LineChart_Events$getData = _user$project$Internal_Events$getData;
var _user$project$LineChart_Events$getSvg = _user$project$Internal_Events$getSvg;
var _user$project$LineChart_Events$onWithOptions = _user$project$Internal_Events$onWithOptions;
var _user$project$LineChart_Events$on = _user$project$Internal_Events$on;
var _user$project$LineChart_Events$onMouseLeave = _user$project$Internal_Events$onMouseLeave;
var _user$project$LineChart_Events$onMouseUp = _user$project$Internal_Events$onMouseUp;
var _user$project$LineChart_Events$onMouseDown = _user$project$Internal_Events$onMouseDown;
var _user$project$LineChart_Events$onMouseMove = _user$project$Internal_Events$onMouseMove;
var _user$project$LineChart_Events$onClick = _user$project$Internal_Events$onClick;
var _user$project$LineChart_Events$custom = _user$project$Internal_Events$custom;
var _user$project$LineChart_Events$click = _user$project$Internal_Events$click;
var _user$project$LineChart_Events$hoverMany = _user$project$Internal_Events$hoverMany;
var _user$project$LineChart_Events$hoverOne = _user$project$Internal_Events$hoverOne;
var _user$project$LineChart_Events$default = _user$project$Internal_Events$default;
var _user$project$LineChart_Events$Options = F3(
	function (a, b, c) {
		return {stopPropagation: a, preventDefault: b, catchOutsideChart: c};
	});

var _user$project$Internal_Legends$defaultLegend = F2(
	function (index, _p0) {
		var _p1 = _p0;
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$class('chart__legend'),
				_1: {
					ctor: '::',
					_0: _user$project$Internal_Svg$transform(
						{
							ctor: '::',
							_0: A2(
								_user$project$Internal_Svg$offset,
								20,
								_elm_lang$core$Basics$toFloat(index) * 20),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: _p1.sample,
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$g,
						{
							ctor: '::',
							_0: _user$project$Internal_Svg$transform(
								{
									ctor: '::',
									_0: A2(_user$project$Internal_Svg$offset, 40, 4),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(_user$project$Internal_Svg$label, 'inherit', _p1.label),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Internal_Legends$defaultLegends = F8(
	function (toX, toY, offsetX, offsetY, hovered, $arguments, system, legends) {
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$class('chart__legends'),
				_1: {
					ctor: '::',
					_0: _user$project$Internal_Svg$transform(
						{
							ctor: '::',
							_0: A3(
								_user$project$Internal_Svg$move,
								system,
								toX(system.x),
								toY(system.y)),
							_1: {
								ctor: '::',
								_0: A2(_user$project$Internal_Svg$offset, offsetX, offsetY),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}
			},
			A2(_elm_lang$core$List$indexedMap, _user$project$Internal_Legends$defaultLegend, legends));
	});
var _user$project$Internal_Legends$viewSample = F4(
	function (_p2, sampleWidth, line, data) {
		var _p3 = _p2;
		var _p5 = _p3.system;
		var _p4 = _p3.lineConfig;
		var shape = _user$project$Internal_Line$shape(line);
		var color = A3(_user$project$Internal_Line$color, _p4, line, data);
		var dotPosition = A2(
			_user$project$LineChart_Coordinate$toData,
			_p5,
			A2(_user$project$Internal_Data$Point, sampleWidth / 2, 0));
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$class('chart__sample'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A5(_user$project$Internal_Line$viewSample, _p4, line, _p3.area, data, sampleWidth),
				_1: {
					ctor: '::',
					_0: A6(_user$project$Internal_Dots$viewSample, _p3.dotsConfig, shape, color, _p5, data, dotPosition),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Internal_Legends$viewGrouped = F3(
	function ($arguments, sampleWidth, container) {
		var toLegend = F2(
			function (line, data) {
				return {
					sample: A4(_user$project$Internal_Legends$viewSample, $arguments, sampleWidth, line, data),
					label: _user$project$Internal_Line$label(line)
				};
			});
		var legends = A3(_elm_lang$core$List$map2, toLegend, $arguments.lines, $arguments.data);
		return A2(container, $arguments.system, legends);
	});
var _user$project$Internal_Legends$viewFree = F5(
	function (system, placement, viewLabel, line, data) {
		var _p6 = function () {
			var _p7 = placement;
			if (_p7.ctor === 'Beginning') {
				return {ctor: '_Tuple3', _0: data, _1: _user$project$Internal_Svg$End, _2: -10};
			} else {
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$List$reverse(data),
					_1: _user$project$Internal_Svg$Start,
					_2: 10
				};
			}
		}();
		var orderedPoints = _p6._0;
		var anchor = _p6._1;
		var xOffset = _p6._2;
		var transform = function (_p8) {
			var _p9 = _p8;
			return _user$project$Internal_Svg$transform(
				{
					ctor: '::',
					_0: A3(_user$project$Internal_Svg$move, system, _p9.x, _p9.y),
					_1: {
						ctor: '::',
						_0: A2(_user$project$Internal_Svg$offset, xOffset, 3),
						_1: {ctor: '[]'}
					}
				});
		};
		var viewLegend = function (_p10) {
			var _p11 = _p10;
			return A2(
				_elm_lang$svg$Svg$g,
				{
					ctor: '::',
					_0: transform(_p11.point),
					_1: {
						ctor: '::',
						_0: _user$project$Internal_Svg$anchorStyle(anchor),
						_1: {ctor: '[]'}
					}
				},
				{
					ctor: '::',
					_0: viewLabel(
						_user$project$Internal_Line$label(line)),
					_1: {ctor: '[]'}
				});
		};
		return A2(
			_user$project$Internal_Utils$viewMaybe,
			_elm_lang$core$List$head(orderedPoints),
			viewLegend);
	});
var _user$project$Internal_Legends$viewFrees = F3(
	function (_p12, placement, view) {
		var _p13 = _p12;
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$class('chart__legends'),
				_1: {ctor: '[]'}
			},
			A3(
				_elm_lang$core$List$map2,
				A3(_user$project$Internal_Legends$viewFree, _p13.system, placement, view),
				_p13.lines,
				_p13.data));
	});
var _user$project$Internal_Legends$view = function ($arguments) {
	var _p14 = $arguments.legends;
	switch (_p14.ctor) {
		case 'Free':
			return A3(_user$project$Internal_Legends$viewFrees, $arguments, _p14._0, _p14._1);
		case 'Grouped':
			return A3(
				_user$project$Internal_Legends$viewGrouped,
				$arguments,
				_p14._0,
				_p14._1($arguments));
		default:
			return _elm_lang$svg$Svg$text('');
	}
};
var _user$project$Internal_Legends$Legend = F2(
	function (a, b) {
		return {sample: a, label: b};
	});
var _user$project$Internal_Legends$Arguments = F9(
	function (a, b, c, d, e, f, g, h, i) {
		return {system: a, dotsConfig: b, lineConfig: c, area: d, lines: e, data: f, x: g, y: h, legends: i};
	});
var _user$project$Internal_Legends$Grouped = F2(
	function (a, b) {
		return {ctor: 'Grouped', _0: a, _1: b};
	});
var _user$project$Internal_Legends$hover = function (data) {
	return A2(
		_user$project$Internal_Legends$Grouped,
		30,
		A5(
			_user$project$Internal_Legends$defaultLegends,
			function (_) {
				return _.max;
			},
			function (_) {
				return _.max;
			},
			0,
			10,
			data));
};
var _user$project$Internal_Legends$default = _user$project$Internal_Legends$hover(
	{ctor: '[]'});
var _user$project$Internal_Legends$hoverOne = function (maybeOne) {
	var _p15 = maybeOne;
	if (_p15.ctor === 'Just') {
		return _user$project$Internal_Legends$hover(
			{
				ctor: '::',
				_0: _p15._0,
				_1: {ctor: '[]'}
			});
	} else {
		return _user$project$Internal_Legends$hover(
			{ctor: '[]'});
	}
};
var _user$project$Internal_Legends$grouped = F4(
	function (toX, toY, offsetX, offsetY) {
		return A2(
			_user$project$Internal_Legends$Grouped,
			30,
			A5(
				_user$project$Internal_Legends$defaultLegends,
				toX,
				toY,
				offsetX,
				offsetY,
				{ctor: '[]'}));
	});
var _user$project$Internal_Legends$groupedCustom = F2(
	function (sampleWidth, container) {
		return A2(
			_user$project$Internal_Legends$Grouped,
			sampleWidth,
			function (_p16) {
				return container;
			});
	});
var _user$project$Internal_Legends$Free = F2(
	function (a, b) {
		return {ctor: 'Free', _0: a, _1: b};
	});
var _user$project$Internal_Legends$None = {ctor: 'None'};
var _user$project$Internal_Legends$none = _user$project$Internal_Legends$None;
var _user$project$Internal_Legends$Ending = {ctor: 'Ending'};
var _user$project$Internal_Legends$byEnding = _user$project$Internal_Legends$Free(_user$project$Internal_Legends$Ending);
var _user$project$Internal_Legends$Beginning = {ctor: 'Beginning'};
var _user$project$Internal_Legends$byBeginning = _user$project$Internal_Legends$Free(_user$project$Internal_Legends$Beginning);

var _user$project$LineChart_Legends$groupedCustom = _user$project$Internal_Legends$groupedCustom;
var _user$project$LineChart_Legends$grouped = _user$project$Internal_Legends$grouped;
var _user$project$LineChart_Legends$byBeginning = _user$project$Internal_Legends$byBeginning;
var _user$project$LineChart_Legends$byEnding = _user$project$Internal_Legends$byEnding;
var _user$project$LineChart_Legends$none = _user$project$Internal_Legends$none;
var _user$project$LineChart_Legends$default = _user$project$Internal_Legends$default;
var _user$project$LineChart_Legends$Legend = F2(
	function (a, b) {
		return {sample: a, label: b};
	});

var _user$project$LineChart_Interpolation$stepped = _user$project$Internal_Interpolation$Stepped;
var _user$project$LineChart_Interpolation$monotone = _user$project$Internal_Interpolation$Monotone;
var _user$project$LineChart_Interpolation$linear = _user$project$Internal_Interpolation$Linear;
var _user$project$LineChart_Interpolation$default = _user$project$LineChart_Interpolation$linear;

var _user$project$LineChart_Axis_Intersection$custom = _user$project$Internal_Axis_Intersection$custom;
var _user$project$LineChart_Axis_Intersection$at = _user$project$Internal_Axis_Intersection$at;
var _user$project$LineChart_Axis_Intersection$atOrigin = _user$project$Internal_Axis_Intersection$atOrigin;
var _user$project$LineChart_Axis_Intersection$default = _user$project$Internal_Axis_Intersection$default;

var _user$project$LineChart$defaultLabel = {
	ctor: '::',
	_0: 'First',
	_1: {
		ctor: '::',
		_0: 'Second',
		_1: {
			ctor: '::',
			_0: 'Third',
			_1: {ctor: '[]'}
		}
	}
};
var _user$project$LineChart$defaultShapes = {
	ctor: '::',
	_0: _user$project$Internal_Dots$Circle,
	_1: {
		ctor: '::',
		_0: _user$project$Internal_Dots$Triangle,
		_1: {
			ctor: '::',
			_0: _user$project$Internal_Dots$Cross,
			_1: {ctor: '[]'}
		}
	}
};
var _user$project$LineChart$defaultColors = {
	ctor: '::',
	_0: _user$project$LineChart_Colors$pink,
	_1: {
		ctor: '::',
		_0: _user$project$LineChart_Colors$blue,
		_1: {
			ctor: '::',
			_0: _user$project$LineChart_Colors$gold,
			_1: {ctor: '[]'}
		}
	}
};
var _user$project$LineChart$defaultLines = A4(_elm_lang$core$List$map4, _user$project$Internal_Line$line, _user$project$LineChart$defaultColors, _user$project$LineChart$defaultShapes, _user$project$LineChart$defaultLabel);
var _user$project$LineChart$defaultConfig = F2(
	function (toX, toY) {
		return {
			y: A3(_user$project$LineChart_Axis$default, 400, '', toY),
			x: A3(_user$project$LineChart_Axis$default, 700, '', toX),
			container: _user$project$LineChart_Container$default('line-chart-1'),
			interpolation: _user$project$LineChart_Interpolation$default,
			intersection: _user$project$LineChart_Axis_Intersection$default,
			legends: _user$project$LineChart_Legends$default,
			events: _user$project$LineChart_Events$default,
			junk: _user$project$LineChart_Junk$default,
			grid: _user$project$LineChart_Grid$default,
			area: _user$project$LineChart_Area$default,
			line: _user$project$LineChart_Line$default,
			dots: _user$project$LineChart_Dots$default
		};
	});
var _user$project$LineChart$toSystem = F2(
	function (config, data) {
		var yRange = A2(
			_user$project$Internal_Coordinate$range,
			function (_p0) {
				return function (_) {
					return _.y;
				}(
					function (_) {
						return _.point;
					}(_p0));
			},
			data);
		var xRange = A2(
			_user$project$Internal_Coordinate$range,
			function (_p1) {
				return function (_) {
					return _.x;
				}(
					function (_) {
						return _.point;
					}(_p1));
			},
			data);
		var size = A2(
			_user$project$Internal_Coordinate$Size,
			_user$project$Internal_Axis$pixels(config.x),
			_user$project$Internal_Axis$pixels(config.y));
		var hasArea = _user$project$Internal_Area$hasArea(config.area);
		var adjustDomainRange = function (domain) {
			return hasArea ? _user$project$Internal_Coordinate$ground(domain) : domain;
		};
		var container = A2(_user$project$Internal_Container$properties, _elm_lang$core$Basics$identity, config.container);
		var frame = A2(_user$project$Internal_Coordinate$Frame, container.margin, size);
		var system = {
			frame: frame,
			x: xRange,
			y: adjustDomainRange(yRange),
			xData: xRange,
			yData: yRange,
			id: container.id
		};
		return _elm_lang$core$Native_Utils.update(
			system,
			{
				x: A2(
					_user$project$Internal_Axis_Range$applyX,
					_user$project$Internal_Axis$range(config.x),
					system),
				y: A2(
					_user$project$Internal_Axis_Range$applyY,
					_user$project$Internal_Axis$range(config.y),
					system)
			});
	});
var _user$project$LineChart$setY = F2(
	function (datum, y) {
		return A3(
			_user$project$Internal_Data$Data,
			datum.user,
			A2(_user$project$Internal_Data$Point, datum.point.x, y),
			datum.isReal);
	});
var _user$project$LineChart$normalize = function (datasets) {
	var _p2 = datasets;
	if (_p2.ctor === '::') {
		var _p3 = _p2._0;
		var toPercentage = F2(
			function (highest, datum) {
				return A2(_user$project$LineChart$setY, datum, (100 * datum.point.y) / highest.point.y);
			});
		return A2(
			_elm_lang$core$List$map,
			A2(_elm_lang$core$List$map2, toPercentage, _p3),
			{ctor: '::', _0: _p3, _1: _p2._1});
	} else {
		return datasets;
	}
};
var _user$project$LineChart$addBelows = F2(
	function (data, dataBelow) {
		var add = F2(
			function (below, datum) {
				return A2(_user$project$LineChart$setY, below, below.point.y + datum.point.y);
			});
		var iterate = F4(
			function (datum0, data, dataBelow, result) {
				iterate:
				while (true) {
					var _p4 = {ctor: '_Tuple2', _0: data, _1: dataBelow};
					if (_p4._0.ctor === '::') {
						if (_p4._1.ctor === '::') {
							var _p8 = _p4._1._0;
							var _p7 = _p4._0._0;
							var _p6 = _p4._1._1;
							var _p5 = _p4._0._1;
							if (_elm_lang$core$Native_Utils.cmp(_p7.point.x, _p8.point.x) > 0) {
								if (_p8.isReal) {
									var _v2 = datum0,
										_v3 = {ctor: '::', _0: _p7, _1: _p5},
										_v4 = _p6,
										_v5 = {
										ctor: '::',
										_0: A2(add, _p8, datum0),
										_1: result
									};
									datum0 = _v2;
									data = _v3;
									dataBelow = _v4;
									result = _v5;
									continue iterate;
								} else {
									var breakdata = _elm_lang$core$Native_Utils.update(
										datum0,
										{isReal: false});
									var _v6 = datum0,
										_v7 = {ctor: '::', _0: _p7, _1: _p5},
										_v8 = _p6,
										_v9 = {
										ctor: '::',
										_0: A2(add, _p8, datum0),
										_1: result
									};
									datum0 = _v6;
									data = _v7;
									dataBelow = _v8;
									result = _v9;
									continue iterate;
								}
							} else {
								var _v10 = _p7,
									_v11 = _p5,
									_v12 = {ctor: '::', _0: _p8, _1: _p6},
									_v13 = result;
								datum0 = _v10;
								data = _v11;
								dataBelow = _v12;
								result = _v13;
								continue iterate;
							}
						} else {
							return result;
						}
					} else {
						if (_p4._1.ctor === '::') {
							var _p10 = _p4._1._0;
							var _p9 = _p4._1._1;
							if (_elm_lang$core$Native_Utils.cmp(datum0.point.x, _p10.point.x) < 1) {
								var _v14 = datum0,
									_v15 = {ctor: '[]'},
									_v16 = _p9,
									_v17 = {
									ctor: '::',
									_0: A2(add, _p10, datum0),
									_1: result
								};
								datum0 = _v14;
								data = _v15;
								dataBelow = _v16;
								result = _v17;
								continue iterate;
							} else {
								var _v18 = datum0,
									_v19 = {ctor: '[]'},
									_v20 = _p9,
									_v21 = {ctor: '::', _0: _p10, _1: result};
								datum0 = _v18;
								data = _v19;
								dataBelow = _v20;
								result = _v21;
								continue iterate;
							}
						} else {
							return result;
						}
					}
				}
			});
		return _elm_lang$core$List$reverse(
			A2(
				_elm_lang$core$Maybe$withDefault,
				{ctor: '[]'},
				A2(
					_user$project$Internal_Utils$withFirst,
					data,
					F2(
						function (first, rest) {
							return A4(
								iterate,
								first,
								rest,
								dataBelow,
								{ctor: '[]'});
						}))));
	});
var _user$project$LineChart$stack = function (dataset) {
	var stackBelows = F2(
		function (dataset, result) {
			stackBelows:
			while (true) {
				var _p11 = dataset;
				if (_p11.ctor === '::') {
					var _p12 = _p11._1;
					var _v23 = _p12,
						_v24 = {
						ctor: '::',
						_0: A3(_elm_lang$core$List$foldl, _user$project$LineChart$addBelows, _p11._0, _p12),
						_1: result
					};
					dataset = _v23;
					result = _v24;
					continue stackBelows;
				} else {
					return result;
				}
			}
		});
	return _elm_lang$core$List$reverse(
		A2(
			stackBelows,
			dataset,
			{ctor: '[]'}));
};
var _user$project$LineChart$toDataPoints = F2(
	function (config, lines) {
		var y = _user$project$Internal_Axis$variable(config.y);
		var x = _user$project$Internal_Axis$variable(config.x);
		var addPoint = function (datum) {
			var _p13 = {
				ctor: '_Tuple2',
				_0: x(datum),
				_1: y(datum)
			};
			if (_p13._0.ctor === 'Just') {
				if (_p13._1.ctor === 'Just') {
					return _elm_lang$core$Maybe$Just(
						A3(
							_user$project$Internal_Data$Data,
							datum,
							A2(_user$project$Internal_Data$Point, _p13._0._0, _p13._1._0),
							true));
				} else {
					return _elm_lang$core$Maybe$Just(
						A3(
							_user$project$Internal_Data$Data,
							datum,
							A2(_user$project$Internal_Data$Point, _p13._0._0, 0),
							false));
				}
			} else {
				if (_p13._1.ctor === 'Just') {
					return _elm_lang$core$Maybe$Nothing;
				} else {
					return _elm_lang$core$Maybe$Nothing;
				}
			}
		};
		var data = A2(
			_elm_lang$core$List$map,
			function (_p14) {
				return A2(
					_elm_lang$core$List$filterMap,
					addPoint,
					_user$project$Internal_Line$data(_p14));
			},
			lines);
		var _p15 = config.area;
		switch (_p15.ctor) {
			case 'None':
				return data;
			case 'Normal':
				return data;
			case 'Stacked':
				return _user$project$LineChart$stack(data);
			default:
				return _user$project$LineChart$normalize(
					_user$project$LineChart$stack(data));
		}
	});
var _user$project$LineChart$chartAreaAttributes = function (system) {
	return {
		ctor: '::',
		_0: _elm_lang$svg$Svg_Attributes$x(
			_elm_lang$core$Basics$toString(system.frame.margin.left)),
		_1: {
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$y(
				_elm_lang$core$Basics$toString(system.frame.margin.top)),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(
					_elm_lang$core$Basics$toString(
						_user$project$Internal_Coordinate$lengthX(system))),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(
						_elm_lang$core$Basics$toString(
							_user$project$Internal_Coordinate$lengthY(system))),
					_1: {ctor: '[]'}
				}
			}
		}
	};
};
var _user$project$LineChart$chartAreaPlatform = F3(
	function (config, data, system) {
		var attributes = _elm_lang$core$List$concat(
			{
				ctor: '::',
				_0: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
					_1: {ctor: '[]'}
				},
				_1: {
					ctor: '::',
					_0: _user$project$LineChart$chartAreaAttributes(system),
					_1: {
						ctor: '::',
						_0: A3(_user$project$Internal_Events$toChartAttributes, data, system, config.events),
						_1: {ctor: '[]'}
					}
				}
			});
		return A2(
			_elm_lang$svg$Svg$rect,
			attributes,
			{ctor: '[]'});
	});
var _user$project$LineChart$clipPath = function (system) {
	return A2(
		_elm_lang$svg$Svg$clipPath,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$id(
				_user$project$Internal_Utils$toChartAreaId(system.id)),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$svg$Svg$rect,
				_user$project$LineChart$chartAreaAttributes(system),
				{ctor: '[]'}),
			_1: {ctor: '[]'}
		});
};
var _user$project$LineChart$container = F4(
	function (config, _p16, junkHtml, plot) {
		var _p17 = _p16;
		var _p18 = _p17.frame;
		var sizeStyles = A3(_user$project$Internal_Container$sizeStyles, config.container, _p18.size.width, _p18.size.height);
		var styles = _elm_lang$html$Html_Attributes$style(
			{
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'position', _1: 'relative'},
				_1: sizeStyles
			});
		var userAttributes = A2(
			_user$project$Internal_Container$properties,
			function (_) {
				return _.attributesHtml;
			},
			config.container);
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '::', _0: styles, _1: userAttributes},
			{ctor: '::', _0: plot, _1: junkHtml});
	});
var _user$project$LineChart$viewBoxAttribute = function (_p19) {
	var _p20 = _p19;
	var _p21 = _p20.frame;
	return _elm_lang$svg$Svg_Attributes$viewBox(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'0 0 ',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(_p21.size.width),
				A2(
					_elm_lang$core$Basics_ops['++'],
					' ',
					_elm_lang$core$Basics$toString(_p21.size.height)))));
};
var _user$project$LineChart$viewCustom = F2(
	function (config, lines) {
		var junkLineInfo = function (line) {
			return {
				ctor: '_Tuple3',
				_0: A3(
					_user$project$Internal_Line$color,
					config.line,
					line,
					{ctor: '[]'}),
				_1: _user$project$Internal_Line$label(line),
				_2: _user$project$Internal_Line$data(line)
			};
		};
		var getJunk = A3(
			_user$project$Internal_Junk$getLayers,
			A2(_elm_lang$core$List$map, junkLineInfo, lines),
			_user$project$Internal_Axis$variable(config.x),
			_user$project$Internal_Axis$variable(config.y));
		var data = A2(_user$project$LineChart$toDataPoints, config, lines);
		var dataSafe = A2(
			_elm_lang$core$List$map,
			_elm_lang$core$List$filter(
				function (_) {
					return _.isReal;
				}),
			data);
		var dataAllSafe = _elm_lang$core$List$concat(dataSafe);
		var system = A2(_user$project$LineChart$toSystem, config, dataAllSafe);
		var addGrid = _user$project$Internal_Junk$addBelow(
			A4(_user$project$Internal_Grid$view, system, config.x, config.y, config.grid));
		var junk = addGrid(
			A2(getJunk, system, config.junk));
		var viewLines = _user$project$Internal_Line$view(
			{system: system, interpolation: config.interpolation, dotsConfig: config.dots, lineConfig: config.line, area: config.area});
		var viewLegends = _user$project$Internal_Legends$view(
			{
				system: system,
				legends: config.legends,
				x: _user$project$Internal_Axis$variable(config.x),
				y: _user$project$Internal_Axis$variable(config.y),
				dotsConfig: config.dots,
				lineConfig: config.line,
				area: config.area,
				data: dataSafe,
				lines: lines
			});
		var dataAll = _elm_lang$core$List$concat(data);
		var attributes = _elm_lang$core$List$concat(
			{
				ctor: '::',
				_0: A2(
					_user$project$Internal_Container$properties,
					function (_) {
						return _.attributesSvg;
					},
					config.container),
				_1: {
					ctor: '::',
					_0: A3(_user$project$Internal_Events$toContainerAttributes, dataAll, system, config.events),
					_1: {
						ctor: '::',
						_0: {
							ctor: '::',
							_0: _user$project$LineChart$viewBoxAttribute(system),
							_1: {ctor: '[]'}
						},
						_1: {ctor: '[]'}
					}
				}
			});
		return A4(
			_user$project$LineChart$container,
			config,
			system,
			junk.html,
			A2(
				_elm_lang$svg$Svg$svg,
				attributes,
				{
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$defs,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _user$project$LineChart$clipPath(system),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$g,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$class('chart__junk--below'),
								_1: {ctor: '[]'}
							},
							junk.below),
						_1: {
							ctor: '::',
							_0: A2(viewLines, lines, data),
							_1: {
								ctor: '::',
								_0: A3(_user$project$LineChart$chartAreaPlatform, config, dataAll, system),
								_1: {
									ctor: '::',
									_0: A3(_user$project$Internal_Axis$viewHorizontal, system, config.intersection, config.x),
									_1: {
										ctor: '::',
										_0: A3(_user$project$Internal_Axis$viewVertical, system, config.intersection, config.y),
										_1: {
											ctor: '::',
											_0: viewLegends,
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$svg$Svg$g,
													{
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$class('chart__junk--above'),
														_1: {ctor: '[]'}
													},
													junk.above),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _user$project$LineChart$dash = _user$project$Internal_Line$dash;
var _user$project$LineChart$line = _user$project$Internal_Line$line;
var _user$project$LineChart$view = F2(
	function (toX, toY) {
		return _user$project$LineChart$viewCustom(
			A2(_user$project$LineChart$defaultConfig, toX, toY));
	});
var _user$project$LineChart$view3 = F5(
	function (toX, toY, dataset1, dataset2, dataset3) {
		return A3(
			_user$project$LineChart$view,
			toX,
			toY,
			_user$project$LineChart$defaultLines(
				{
					ctor: '::',
					_0: dataset1,
					_1: {
						ctor: '::',
						_0: dataset2,
						_1: {
							ctor: '::',
							_0: dataset3,
							_1: {ctor: '[]'}
						}
					}
				}));
	});
var _user$project$LineChart$view2 = F4(
	function (toX, toY, dataset1, dataset2) {
		return A3(
			_user$project$LineChart$view,
			toX,
			toY,
			_user$project$LineChart$defaultLines(
				{
					ctor: '::',
					_0: dataset1,
					_1: {
						ctor: '::',
						_0: dataset2,
						_1: {ctor: '[]'}
					}
				}));
	});
var _user$project$LineChart$view1 = F3(
	function (toX, toY, dataset) {
		return A3(
			_user$project$LineChart$view,
			toX,
			toY,
			_user$project$LineChart$defaultLines(
				{
					ctor: '::',
					_0: dataset,
					_1: {ctor: '[]'}
				}));
	});
var _user$project$LineChart$Config = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return {x: a, y: b, container: c, intersection: d, interpolation: e, legends: f, events: g, area: h, grid: i, line: j, dots: k, junk: l};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};

var _user$project$Area$source = '\n  -- MODEL\n\n\n  type alias Model =\n    { data : Data\n    , hinted : List Datum\n    }\n\n\n  type alias Data =\n    { nora : List Datum\n    , noah : List Datum\n    , nina : List Datum\n    }\n\n\n  type alias Datum =\n    { time : Time.Time\n    , velocity : Float\n    }\n\n\n\n  -- INIT\n\n\n  init : ( Model, Cmd Msg )\n  init =\n    ( { data = Data [] [] []\n      , hinted = []\n      }\n    , generateData\n    )\n\n\n  generateData : Cmd Msg\n  generateData =\n    let\n      genNumbers =\n        Random.list 40 (Random.float 5 20)\n    in\n    Random.map3 (,,) genNumbers genNumbers genNumbers\n      |> Random.generate RecieveData\n\n\n\n  -- API\n\n\n  setData : ( List Float, List Float, List Float ) -> Model -> Model\n  setData ( n1, n2, n3 ) model =\n    { model | data = Data (toData n1) (toData n2) (toData n3) }\n\n\n  toData : List Float -> List Datum\n  toData numbers =\n    let \n      toDatum index velocity = \n        Datum (indexToTime index) velocity \n    in\n    List.indexedMap toDatum numbers\n\n\n  indexToTime : Int -> Time.Time\n  indexToTime index =\n    Time.hour * 24 * 356 * 45 + -- 45 years\n    Time.hour * 24 * 30 + -- a month\n    Time.hour * 1 * toFloat index -- hours from first datum\n\n\n  setHint : List Datum -> Model -> Model\n  setHint hinted model =\n    { model | hinted = hinted }\n\n\n\n  -- UPDATE\n\n\n  type Msg\n    = RecieveData ( List Float, List Float, List Float )\n    | Hint (List Datum)\n\n\n  update : Msg -> Model -> ( Model, Cmd Msg )\n  update msg model =\n    case msg of\n      RecieveData numbers ->\n        model\n          |> setData numbers\n          |> addCmd Cmd.none\n\n      Hint points ->\n        model\n          |> setHint points\n          |> addCmd Cmd.none\n\n\n  addCmd : Cmd Msg -> Model -> ( Model, Cmd Msg )\n  addCmd cmd model =\n    ( model, Cmd.none )\n\n\n\n  -- VIEW\n\n\n  view : Model -> Html.Html Msg\n  view model =\n    Html.div [] \n      [ LineChart.viewCustom (chartConfig model) \n          [ LineChart.line Colors.pink Dots.diamond  \"Nora\" model.data.nora\n          , LineChart.line Colors.cyan Dots.circle   \"Noah\" model.data.noah\n          , LineChart.line Colors.blue Dots.triangle \"Nina\" model.data.nina\n          ]\n      ]\n\n\n\n  -- CHART CONFIG\n\n\n  chartConfig : Model -> LineChart.Config Datum Msg\n  chartConfig model =\n    { y = Axis.default 450 \"velocity\" .velocity\n    , x = Axis.time 1270 \"time\" .time\n    , container = containerConfig\n    , interpolation = Interpolation.monotone\n    , intersection = Intersection.default\n    , legends = Legends.default\n    , events = Events.hoverMany Hint\n    , junk = Junk.hoverMany model.hinted formatX formatY\n    , grid = Grid.dots 1 Colors.gray\n    , area = Area.stacked 0.5\n    , line = Line.default\n    , dots = Dots.custom (Dots.empty 5 1)\n    }\n\n\n  containerConfig : Container.Config Msg\n  containerConfig =\n    Container.custom\n      { attributesHtml = []\n      , attributesSvg = []\n      , size = Container.relative\n      , margin = Container.Margin 30 100 30 70\n      , id = \"line-chart-area\"\n      }\n\n\n  formatX : Datum -> String\n  formatX datum =\n    Date.Format.format \"%e. %b, %Y\" (Date.fromTime datum.time)\n\n\n  formatY : Datum -> String\n  formatY datum =\n    toString (round100 datum.velocity) ++ \" m/s\"\n\n\n\n  -- UTILS\n\n\n  round100 : Float -> Float\n  round100 float =\n    toFloat (round (float * 100)) / 100\n\n\n\n\n  -- PROGRAM \n\n\n  main : Program Never Model Msg\n  main =\n    Html.program\n      { init = init\n      , update = update\n      , view = view\n      , subscriptions = always Sub.none\n      }\n\n\n  ';
var _user$project$Area$indexToTime = function (index) {
	return ((((_elm_lang$core$Time$hour * 24) * 365) * 45) + ((_elm_lang$core$Time$hour * 24) * 30)) + ((_elm_lang$core$Time$hour * 1) * _elm_lang$core$Basics$toFloat(index));
};
var _user$project$Area$round100 = function ($float) {
	return _elm_lang$core$Basics$toFloat(
		_elm_lang$core$Basics$round($float * 100)) / 100;
};
var _user$project$Area$formatY = function (datum) {
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_elm_lang$core$Basics$toString(
			_user$project$Area$round100(datum.velocity)),
		' m/s');
};
var _user$project$Area$formatX = function (datum) {
	return A2(
		_mgold$elm_date_format$Date_Format$format,
		'%e. %b, %Y',
		_elm_lang$core$Date$fromTime(datum.time));
};
var _user$project$Area$containerConfig = _user$project$LineChart_Container$custom(
	{
		attributesHtml: {ctor: '[]'},
		attributesSvg: {ctor: '[]'},
		size: _user$project$LineChart_Container$relative,
		margin: A4(_user$project$LineChart_Container$Margin, 30, 100, 30, 70),
		id: 'line-chart-area'
	});
var _user$project$Area$addCmd = F2(
	function (cmd, model) {
		return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
	});
var _user$project$Area$setHint = F2(
	function (hinted, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{hinted: hinted});
	});
var _user$project$Area$setData = F2(
	function (data, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{data: data});
	});
var _user$project$Area$update = F2(
	function (msg, model) {
		var _p0 = msg;
		if (_p0.ctor === 'RecieveData') {
			return A2(
				_user$project$Area$addCmd,
				_elm_lang$core$Platform_Cmd$none,
				A2(_user$project$Area$setData, _p0._0, model));
		} else {
			return A2(
				_user$project$Area$addCmd,
				_elm_lang$core$Platform_Cmd$none,
				A2(_user$project$Area$setHint, _p0._0, model));
		}
	});
var _user$project$Area$Model = F2(
	function (a, b) {
		return {data: a, hinted: b};
	});
var _user$project$Area$Data = F3(
	function (a, b, c) {
		return {nora: a, noah: b, nina: c};
	});
var _user$project$Area$Datum = F2(
	function (a, b) {
		return {time: a, velocity: b};
	});
var _user$project$Area$toData = function (numbers) {
	var toDatum = F2(
		function (index, velocity) {
			return A2(
				_user$project$Area$Datum,
				_user$project$Area$indexToTime(index),
				velocity);
		});
	return A2(_elm_lang$core$List$indexedMap, toDatum, numbers);
};
var _user$project$Area$Hint = function (a) {
	return {ctor: 'Hint', _0: a};
};
var _user$project$Area$chartConfig = function (model) {
	return {
		y: A3(
			_user$project$LineChart_Axis$default,
			450,
			'velocity',
			function (_) {
				return _.velocity;
			}),
		x: A3(
			_user$project$LineChart_Axis$time,
			1270,
			'time',
			function (_) {
				return _.time;
			}),
		container: _user$project$Area$containerConfig,
		interpolation: _user$project$LineChart_Interpolation$monotone,
		intersection: _user$project$LineChart_Axis_Intersection$default,
		legends: _user$project$LineChart_Legends$default,
		events: _user$project$LineChart_Events$hoverMany(_user$project$Area$Hint),
		junk: A3(_user$project$LineChart_Junk$hoverMany, model.hinted, _user$project$Area$formatX, _user$project$Area$formatY),
		grid: A2(_user$project$LineChart_Grid$dots, 1, _user$project$LineChart_Colors$gray),
		area: _user$project$LineChart_Area$stacked(0.5),
		line: _user$project$LineChart_Line$default,
		dots: _user$project$LineChart_Dots$custom(
			A2(_user$project$LineChart_Dots$empty, 5, 1))
	};
};
var _user$project$Area$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_user$project$LineChart$viewCustom,
				_user$project$Area$chartConfig(model),
				{
					ctor: '::',
					_0: A4(_user$project$LineChart$line, _user$project$LineChart_Colors$pink, _user$project$LineChart_Dots$diamond, 'Nora', model.data.nora),
					_1: {
						ctor: '::',
						_0: A4(_user$project$LineChart$line, _user$project$LineChart_Colors$cyan, _user$project$LineChart_Dots$circle, 'Noah', model.data.noah),
						_1: {
							ctor: '::',
							_0: A4(_user$project$LineChart$line, _user$project$LineChart_Colors$blue, _user$project$LineChart_Dots$triangle, 'Nina', model.data.nina),
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$Area$RecieveData = function (a) {
	return {ctor: 'RecieveData', _0: a};
};
var _user$project$Area$generateData = function () {
	var compile = F3(
		function (a, b, c) {
			return A3(
				_user$project$Area$Data,
				_user$project$Area$toData(a),
				_user$project$Area$toData(b),
				_user$project$Area$toData(c));
		});
	var genNumbers = A2(
		_elm_lang$core$Random$list,
		40,
		A2(_elm_lang$core$Random$float, 5, 20));
	return A2(
		_user$project$Random_Pipeline$send,
		_user$project$Area$RecieveData,
		A2(
			_user$project$Random_Pipeline$with,
			genNumbers,
			A2(
				_user$project$Random_Pipeline$with,
				genNumbers,
				A2(
					_user$project$Random_Pipeline$with,
					genNumbers,
					_user$project$Random_Pipeline$generate(compile)))));
}();
var _user$project$Area$init = {
	ctor: '_Tuple2',
	_0: {
		data: A3(
			_user$project$Area$Data,
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'}),
		hinted: {ctor: '[]'}
	},
	_1: _user$project$Area$generateData
};
var _user$project$Area$main = _elm_lang$html$Html$program(
	{
		init: _user$project$Area$init,
		update: _user$project$Area$update,
		view: _user$project$Area$view,
		subscriptions: _elm_lang$core$Basics$always(_elm_lang$core$Platform_Sub$none)
	})();

var _user$project$LineChart_Axis_Title$custom = _user$project$Internal_Axis_Title$custom;
var _user$project$LineChart_Axis_Title$atPosition = _user$project$Internal_Axis_Title$atPosition;
var _user$project$LineChart_Axis_Title$atAxisMax = _user$project$Internal_Axis_Title$atAxisMax;
var _user$project$LineChart_Axis_Title$atDataMax = _user$project$Internal_Axis_Title$atDataMax;
var _user$project$LineChart_Axis_Title$default = _user$project$Internal_Axis_Title$default;

var _user$project$Lines$source = '\n  -- MODEL\n\n\n  type alias Model =\n    { data : Data\n    , hinted : Maybe Datum\n    }\n\n\n  type alias Data =\n    { denmark : List Datum\n    , sweden : List Datum\n    , iceland : List Datum\n    , greenland : List Datum\n    , norway : List Datum\n    , finland : List Datum\n    }\n\n\n  type alias Datum =\n    { time : Time.Time\n    , rain : Float\n    }\n\n\n\n  -- INIT\n\n\n  init : ( Model, Cmd Msg )\n  init =\n    ( { data = Data [] [] [] [] [] []\n      , hinted = Nothing\n      }\n    , generateData\n    )\n\n\n\n  -- API\n\n\n  setData : Data -> Model -> Model\n  setData data model =\n    { model | data = data }\n\n\n  setHint : Maybe Datum -> Model -> Model\n  setHint hinted model =\n    { model | hinted = hinted }\n\n\n\n  -- UPDATE\n\n\n  type Msg\n    = RecieveData Data\n    | Hint (Maybe Datum)\n\n\n  update : Msg -> Model -> ( Model, Cmd Msg )\n  update msg model =\n    case msg of\n      RecieveData numbers ->\n        model\n          |> setData numbers\n          |> addCmd Cmd.none\n\n      Hint point ->\n        model\n          |> setHint point\n          |> addCmd Cmd.none\n\n\n  addCmd : Cmd Msg -> Model -> ( Model, Cmd Msg )\n  addCmd cmd model =\n    ( model, Cmd.none )\n\n\n\n  -- VIEW\n\n\n  view : Model -> Html.Html Msg\n  view model =\n    Html.div [] \n      [ LineChart.viewCustom (chartConfig model) \n          [ LineChart.line (Manipulate.lighten 0.2 Colors.cyan) Dots.circle \"Denmark\"   model.data.denmark\n          , LineChart.line (Manipulate.lighten 0   Colors.cyan) Dots.circle \"Sweden\"    model.data.sweden\n          , LineChart.line (Manipulate.lighten 0.2 Colors.blue) Dots.circle \"Iceland\"   model.data.iceland\n          , LineChart.line (Manipulate.lighten 0   Colors.blue) Dots.circle \"Greenland\" model.data.greenland\n          , LineChart.line (Manipulate.lighten 0   Colors.pink) Dots.circle \"Norway\"    model.data.norway\n          , LineChart.line (Manipulate.darken  0.2 Colors.pink) Dots.circle \"Finland\"   model.data.finland\n          ]\n      ]\n\n\n\n  -- CHART CONFIG\n\n\n  chartConfig : Model -> LineChart.Config Datum Msg\n  chartConfig model =\n    { y = yAxisConfig\n    , x = xAxisConfig\n    , container = containerConfig\n    , interpolation = Interpolation.monotone\n    , intersection = Intersection.default\n    , legends = Legends.default\n    , events = eventsConfig\n    , junk = Junk.default\n    , grid = Grid.default\n    , area = Area.default\n    , line = lineConfig model.hinted\n    , dots = Dots.custom (Dots.disconnected 4 2)\n    }\n      \n\n\n  -- CHART CONFIG / AXES  \n\n\n  yAxisConfig : Axis.Config Datum Msg\n  yAxisConfig =\n    Axis.custom\n      { title = Title.atDataMax -10 -10 \"Rain\"\n      , variable = Just << .rain\n      , pixels = 450\n      , range = Range.padded 20 20\n      , axisLine = AxisLine.rangeFrame Colors.gray\n      , ticks = Ticks.custom <| \\dataRange axisRange ->\n          [ tickRain ( dataRange.min, \"bits\" )\n          , tickRain ( middle dataRange, \"some\" )\n          , tickRain ( dataRange.max, \"lots\" )\n          ]\n      }\n\n\n  xAxisConfig : Axis.Config Datum Msg\n  xAxisConfig =\n    Axis.custom\n      { title = Title.default \"Time\"\n      , variable = Just << .time\n      , pixels = 1270\n      , range = Range.padded 20 20\n      , axisLine = AxisLine.none\n      , ticks = Ticks.timeCustom 10 tickTime\n      }\n\n\n\n  -- CHART CONFIG / AXES / TICKS\n\n\n  tickRain : ( Float, String ) -> Tick.Config msg\n  tickRain ( value, label ) =\n    Tick.custom\n      { position = value\n      , color = Colors.gray\n      , width = 1\n      , length = 5\n      , grid = True\n      , direction = Tick.negative\n      , label = Just (tickLabel label)\n      }\n\n\n  tickTime : Tick.Time -> Tick.Config msg\n  tickTime time =\n    let label = Tick.format time in\n    Tick.custom\n      { position = time.timestamp\n      , color = Colors.gray\n      , width = 1\n      , length = 5\n      , grid = False\n      , direction = Tick.negative\n      , label = Just (tickLabel label)\n      }\n\n\n  tickLabel : String -> Svg.Svg msg \n  tickLabel =\n    Junk.label Colors.black\n\n\n\n  -- CHART CONFIG / CONTIANER  \n\n\n  containerConfig : Container.Config Msg \n  containerConfig =\n    Container.custom\n      { attributesHtml = []\n      , attributesSvg = []\n      , size = Container.relative\n      , margin = Container.Margin 30 180 30 70\n      , id = \"line-chart-lines\"\n      }\n\n\n\n  -- CHART CONFIG / EVENTS  \n\n\n  eventsConfig : Events.Config Datum Msg \n  eventsConfig =\n    Events.custom\n      [ Events.onMouseMove Hint Events.getNearest\n      , Events.onMouseLeave (Hint Nothing)\n      ]\n\n\n\n  -- CHART CONFIG / LINE\n\n\n  lineConfig : Maybe Datum -> Line.Config Datum\n  lineConfig maybeHovered =\n    Line.custom (toLineStyle maybeHovered)\n\n\n  toLineStyle : Maybe Datum -> List Datum -> Line.Style\n  toLineStyle maybeHovered lineData =\n    case maybeHovered of\n      Nothing ->\n        Line.style 1 identity\n\n      Just hovered ->\n        if List.any ((==) hovered) lineData then\n          Line.style 2 identity\n        else\n          Line.style 1 (Manipulate.grayscale)\n\n\n\n  -- UTILS\n\n\n  round10 : Float -> Float\n  round10 float =\n    toFloat (round (float * 10)) / 10\n\n\n  middle : Coordinate.Range -> Float\n  middle r =\n    r.min + (r.max - r.min) / 2\n\n\n\n  -- GENERATE DATA\n\n\n  generateData : Cmd Msg\n  generateData =\n    let\n      genNumbers min max =\n        Random.list 10 (Random.float min max)\n\n      compile a b c d e f =\n        Data (toData a) (toData b) (toData c) (toData d) (toData e) (toData f)\n    in\n    Random.Pipeline.generate compile\n      |> Random.Pipeline.with (genNumbers 50 90)\n      |> Random.Pipeline.with (genNumbers 20 60)\n      |> Random.Pipeline.with (genNumbers 30 60)\n      |> Random.Pipeline.with (genNumbers 40 90)\n      |> Random.Pipeline.with (genNumbers 80 100)\n      |> Random.Pipeline.with (genNumbers 70 90)\n      |> Random.Pipeline.send RecieveData\n\n\n  toData : List Float -> List Datum\n  toData numbers =\n    let \n      toDatum index rain = \n        Datum (indexToTime index) rain \n    in\n    List.indexedMap toDatum numbers\n\n\n  indexToTime : Int -> Time.Time\n  indexToTime index =\n    Time.hour * 24 * 365 * 30 + xInterval * toFloat index\n\n\n  xInterval : Time.Time\n  xInterval =\n    Time.hour * 24 * 31\n\n\n\n  -- PROGRAM \n\n\n  main : Program Never Model Msg\n  main =\n    Html.program\n      { init = init\n      , update = update\n      , view = view\n      , subscriptions = always Sub.none\n      }\n\n  ';
var _user$project$Lines$xInterval = (_elm_lang$core$Time$hour * 24) * 31;
var _user$project$Lines$indexToTime = function (index) {
	return (((_elm_lang$core$Time$hour * 24) * 365) * 30) + (_user$project$Lines$xInterval * _elm_lang$core$Basics$toFloat(index));
};
var _user$project$Lines$middle = function (r) {
	return r.min + ((r.max - r.min) / 2);
};
var _user$project$Lines$round10 = function ($float) {
	return _elm_lang$core$Basics$toFloat(
		_elm_lang$core$Basics$round($float * 10)) / 10;
};
var _user$project$Lines$toLineStyle = F2(
	function (maybeHovered, lineData) {
		var _p0 = maybeHovered;
		if (_p0.ctor === 'Nothing') {
			return A2(_user$project$LineChart_Line$style, 1, _elm_lang$core$Basics$identity);
		} else {
			return A2(
				_elm_lang$core$List$any,
				F2(
					function (x, y) {
						return _elm_lang$core$Native_Utils.eq(x, y);
					})(_p0._0),
				lineData) ? A2(_user$project$LineChart_Line$style, 2, _elm_lang$core$Basics$identity) : A2(_user$project$LineChart_Line$style, 1, _eskimoblood$elm_color_extra$Color_Manipulate$grayscale);
		}
	});
var _user$project$Lines$lineConfig = function (maybeHovered) {
	return _user$project$LineChart_Line$custom(
		_user$project$Lines$toLineStyle(maybeHovered));
};
var _user$project$Lines$containerConfig = _user$project$LineChart_Container$custom(
	{
		attributesHtml: {ctor: '[]'},
		attributesSvg: {ctor: '[]'},
		size: _user$project$LineChart_Container$relative,
		margin: A4(_user$project$LineChart_Container$Margin, 30, 180, 30, 70),
		id: 'line-chart-lines'
	});
var _user$project$Lines$tickLabel = _user$project$LineChart_Junk$label(_user$project$LineChart_Colors$black);
var _user$project$Lines$tickTime = function (time) {
	var label = _user$project$LineChart_Axis_Tick$format(time);
	return _user$project$LineChart_Axis_Tick$custom(
		{
			position: time.timestamp,
			color: _user$project$LineChart_Colors$gray,
			width: 1,
			length: 5,
			grid: false,
			direction: _user$project$LineChart_Axis_Tick$negative,
			label: _elm_lang$core$Maybe$Just(
				_user$project$Lines$tickLabel(label))
		});
};
var _user$project$Lines$tickRain = function (_p1) {
	var _p2 = _p1;
	return _user$project$LineChart_Axis_Tick$custom(
		{
			position: _p2._0,
			color: _user$project$LineChart_Colors$gray,
			width: 1,
			length: 5,
			grid: true,
			direction: _user$project$LineChart_Axis_Tick$negative,
			label: _elm_lang$core$Maybe$Just(
				_user$project$Lines$tickLabel(_p2._1))
		});
};
var _user$project$Lines$xAxisConfig = _user$project$LineChart_Axis$custom(
	{
		title: _user$project$LineChart_Axis_Title$default('Time'),
		variable: function (_p3) {
			return _elm_lang$core$Maybe$Just(
				function (_) {
					return _.time;
				}(_p3));
		},
		pixels: 1270,
		range: A2(_user$project$LineChart_Axis_Range$padded, 20, 20),
		axisLine: _user$project$LineChart_Axis_Line$none,
		ticks: A2(_user$project$LineChart_Axis_Ticks$timeCustom, 10, _user$project$Lines$tickTime)
	});
var _user$project$Lines$yAxisConfig = _user$project$LineChart_Axis$custom(
	{
		title: A3(_user$project$LineChart_Axis_Title$atDataMax, -10, -10, 'Rain'),
		variable: function (_p4) {
			return _elm_lang$core$Maybe$Just(
				function (_) {
					return _.rain;
				}(_p4));
		},
		pixels: 450,
		range: A2(_user$project$LineChart_Axis_Range$padded, 20, 20),
		axisLine: _user$project$LineChart_Axis_Line$rangeFrame(_user$project$LineChart_Colors$gray),
		ticks: _user$project$LineChart_Axis_Ticks$custom(
			F2(
				function (dataRange, axisRange) {
					return {
						ctor: '::',
						_0: _user$project$Lines$tickRain(
							{ctor: '_Tuple2', _0: dataRange.min, _1: 'bits'}),
						_1: {
							ctor: '::',
							_0: _user$project$Lines$tickRain(
								{
									ctor: '_Tuple2',
									_0: _user$project$Lines$middle(dataRange),
									_1: 'some'
								}),
							_1: {
								ctor: '::',
								_0: _user$project$Lines$tickRain(
									{ctor: '_Tuple2', _0: dataRange.max, _1: 'lots'}),
								_1: {ctor: '[]'}
							}
						}
					};
				}))
	});
var _user$project$Lines$addCmd = F2(
	function (cmd, model) {
		return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
	});
var _user$project$Lines$setHint = F2(
	function (hinted, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{hinted: hinted});
	});
var _user$project$Lines$setData = F2(
	function (data, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{data: data});
	});
var _user$project$Lines$update = F2(
	function (msg, model) {
		var _p5 = msg;
		if (_p5.ctor === 'RecieveData') {
			return A2(
				_user$project$Lines$addCmd,
				_elm_lang$core$Platform_Cmd$none,
				A2(_user$project$Lines$setData, _p5._0, model));
		} else {
			return A2(
				_user$project$Lines$addCmd,
				_elm_lang$core$Platform_Cmd$none,
				A2(_user$project$Lines$setHint, _p5._0, model));
		}
	});
var _user$project$Lines$Model = F2(
	function (a, b) {
		return {data: a, hinted: b};
	});
var _user$project$Lines$Data = F6(
	function (a, b, c, d, e, f) {
		return {denmark: a, sweden: b, iceland: c, greenland: d, norway: e, finland: f};
	});
var _user$project$Lines$Datum = F2(
	function (a, b) {
		return {time: a, rain: b};
	});
var _user$project$Lines$toData = function (numbers) {
	var toDatum = F2(
		function (index, rain) {
			return A2(
				_user$project$Lines$Datum,
				_user$project$Lines$indexToTime(index),
				rain);
		});
	return A2(_elm_lang$core$List$indexedMap, toDatum, numbers);
};
var _user$project$Lines$Hint = function (a) {
	return {ctor: 'Hint', _0: a};
};
var _user$project$Lines$eventsConfig = _user$project$LineChart_Events$custom(
	{
		ctor: '::',
		_0: A2(_user$project$LineChart_Events$onMouseMove, _user$project$Lines$Hint, _user$project$LineChart_Events$getNearest),
		_1: {
			ctor: '::',
			_0: _user$project$LineChart_Events$onMouseLeave(
				_user$project$Lines$Hint(_elm_lang$core$Maybe$Nothing)),
			_1: {ctor: '[]'}
		}
	});
var _user$project$Lines$chartConfig = function (model) {
	return {
		y: _user$project$Lines$yAxisConfig,
		x: _user$project$Lines$xAxisConfig,
		container: _user$project$Lines$containerConfig,
		interpolation: _user$project$LineChart_Interpolation$monotone,
		intersection: _user$project$LineChart_Axis_Intersection$default,
		legends: _user$project$LineChart_Legends$default,
		events: _user$project$Lines$eventsConfig,
		junk: _user$project$LineChart_Junk$default,
		grid: _user$project$LineChart_Grid$default,
		area: _user$project$LineChart_Area$default,
		line: _user$project$Lines$lineConfig(model.hinted),
		dots: _user$project$LineChart_Dots$custom(
			A2(_user$project$LineChart_Dots$disconnected, 4, 2))
	};
};
var _user$project$Lines$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_user$project$LineChart$viewCustom,
				_user$project$Lines$chartConfig(model),
				{
					ctor: '::',
					_0: A4(
						_user$project$LineChart$line,
						A2(_eskimoblood$elm_color_extra$Color_Manipulate$lighten, 0.2, _user$project$LineChart_Colors$cyan),
						_user$project$LineChart_Dots$circle,
						'Denmark',
						model.data.denmark),
					_1: {
						ctor: '::',
						_0: A4(
							_user$project$LineChart$line,
							A2(_eskimoblood$elm_color_extra$Color_Manipulate$lighten, 0, _user$project$LineChart_Colors$cyan),
							_user$project$LineChart_Dots$circle,
							'Sweden',
							model.data.sweden),
						_1: {
							ctor: '::',
							_0: A4(
								_user$project$LineChart$line,
								A2(_eskimoblood$elm_color_extra$Color_Manipulate$lighten, 0.2, _user$project$LineChart_Colors$blue),
								_user$project$LineChart_Dots$circle,
								'Iceland',
								model.data.iceland),
							_1: {
								ctor: '::',
								_0: A4(
									_user$project$LineChart$line,
									A2(_eskimoblood$elm_color_extra$Color_Manipulate$lighten, 0, _user$project$LineChart_Colors$blue),
									_user$project$LineChart_Dots$circle,
									'Greenland',
									model.data.greenland),
								_1: {
									ctor: '::',
									_0: A4(
										_user$project$LineChart$line,
										A2(_eskimoblood$elm_color_extra$Color_Manipulate$lighten, 0, _user$project$LineChart_Colors$pink),
										_user$project$LineChart_Dots$circle,
										'Norway',
										model.data.norway),
									_1: {
										ctor: '::',
										_0: A4(
											_user$project$LineChart$line,
											A2(_eskimoblood$elm_color_extra$Color_Manipulate$darken, 0.2, _user$project$LineChart_Colors$pink),
											_user$project$LineChart_Dots$circle,
											'Finland',
											model.data.finland),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$Lines$RecieveData = function (a) {
	return {ctor: 'RecieveData', _0: a};
};
var _user$project$Lines$generateData = function () {
	var compile = F6(
		function (a, b, c, d, e, f) {
			return A6(
				_user$project$Lines$Data,
				_user$project$Lines$toData(a),
				_user$project$Lines$toData(b),
				_user$project$Lines$toData(c),
				_user$project$Lines$toData(d),
				_user$project$Lines$toData(e),
				_user$project$Lines$toData(f));
		});
	var genNumbers = F2(
		function (min, max) {
			return A2(
				_elm_lang$core$Random$list,
				10,
				A2(_elm_lang$core$Random$float, min, max));
		});
	return A2(
		_user$project$Random_Pipeline$send,
		_user$project$Lines$RecieveData,
		A2(
			_user$project$Random_Pipeline$with,
			A2(genNumbers, 70, 90),
			A2(
				_user$project$Random_Pipeline$with,
				A2(genNumbers, 80, 100),
				A2(
					_user$project$Random_Pipeline$with,
					A2(genNumbers, 40, 90),
					A2(
						_user$project$Random_Pipeline$with,
						A2(genNumbers, 30, 60),
						A2(
							_user$project$Random_Pipeline$with,
							A2(genNumbers, 20, 60),
							A2(
								_user$project$Random_Pipeline$with,
								A2(genNumbers, 50, 90),
								_user$project$Random_Pipeline$generate(compile))))))));
}();
var _user$project$Lines$init = {
	ctor: '_Tuple2',
	_0: {
		data: A6(
			_user$project$Lines$Data,
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'}),
		hinted: _elm_lang$core$Maybe$Nothing
	},
	_1: _user$project$Lines$generateData
};
var _user$project$Lines$main = _elm_lang$html$Html$program(
	{
		init: _user$project$Lines$init,
		update: _user$project$Lines$update,
		view: _user$project$Lines$view,
		subscriptions: _elm_lang$core$Basics$always(_elm_lang$core$Platform_Sub$none)
	})();

var _user$project$Selection$source = '\n  -- MODEL\n\n\n  type alias Model =\n    { data : Data\n    , hovered : Maybe Float\n    , selection : Maybe Selection\n    , dragging : Bool\n    , hinted : Maybe Datum\n    }\n\n\n  type alias Selection =\n    { xStart : Float\n    , xEnd : Float\n    }\n\n\n  type alias Data =\n    { nora : List Datum\n    , noah : List Datum\n    , nina : List Datum\n    }\n\n\n\n  -- INIT\n\n\n  init : ( Model, Cmd Msg )\n  init =\n    ( { data = Data [] [] []\n      , hovered = Nothing\n      , selection = Nothing\n      , dragging = False\n      , hinted = Nothing\n      }\n    , generateData\n    )\n\n\n  generateData : Cmd Msg\n  generateData =\n    let\n      genNumbers =\n        Random.list 201 (Random.float 0 20)\n    in\n    Random.map3 (,,) genNumbers genNumbers genNumbers\n      |> Random.generate RecieveData\n\n\n\n  -- MODEL API\n\n\n  setData : ( List Float, List Float, List Float ) -> Model -> Model\n  setData ( n1, n2, n3 ) model =\n    { model | data = Data (toData n1) (toData n2) (toData n3) }\n\n\n  toData : List Float -> List Datum\n  toData numbers =\n    List.indexedMap (\\i -> Datum (toFloat i)) numbers\n\n\n  setSelection : Maybe Selection -> Model -> Model\n  setSelection selection model =\n    { model | selection = selection }\n\n\n  setDragging : Bool -> Model -> Model\n  setDragging dragging model =\n    { model | dragging = dragging }\n\n\n  setHovered : Maybe Float -> Model -> Model\n  setHovered hovered model =\n    { model | hovered = hovered }\n\n\n  setHint : Maybe Datum -> Model -> Model\n  setHint hinted model =\n    { model | hinted = hinted }\n\n\n  getSelectionXStart : Float -> Model -> Float\n  getSelectionXStart hovered model =\n    case model.selection of\n      Just selection -> selection.xStart\n      Nothing        -> hovered\n\n\n\n  -- UPDATE\n\n\n  type Msg\n    = RecieveData ( List Float, List Float, List Float )\n    -- Chart Main\n    | Hold Datum\n    | Move Datum\n    | Drop Datum\n    | LeaveChart Datum\n    | LeaveContainer Datum\n    -- Chart Zoom\n    | Hint (Maybe Datum)\n\n\n  update : Msg -> Model -> ( Model, Cmd Msg )\n  update msg model =\n    case msg of\n      RecieveData numbers ->\n        model\n          |> setData numbers\n          |> addCmd Cmd.none\n\n      Hold point ->\n        model\n          |> setSelection Nothing\n          |> setDragging True\n          |> addCmd Cmd.none\n\n      Move point ->\n        if model.dragging then\n          let\n            start = getSelectionXStart point.x model\n            newSelection = Selection start point.x\n          in\n          model\n            |> setSelection (Just newSelection)\n            |> setHovered (Just point.x)\n            |> addCmd Cmd.none\n        else\n          model\n            |> setHovered (Just point.x)\n            |> addCmd Cmd.none\n\n      Drop point ->\n        if point.x == getSelectionXStart point.x model then\n          model\n            |> setSelection Nothing\n            |> setDragging False\n            |> addCmd Cmd.none\n        else\n          model\n            |> setDragging False\n            |> addCmd Cmd.none\n\n      LeaveChart point ->\n        model\n          |> setHovered Nothing\n          |> addCmd Cmd.none\n\n      LeaveContainer point ->\n        model\n          |> setDragging False\n          |> setHovered Nothing\n          |> addCmd Cmd.none\n\n      Hint point ->\n        model\n          |> setHint point\n          |> addCmd Cmd.none\n\n\n  addCmd : Cmd Msg -> Model -> ( Model, Cmd Msg )\n  addCmd cmd model =\n    ( model, Cmd.none )\n\n\n\n  -- VIEW\n\n\n  view : Model -> Html.Html Msg\n  view model =\n    let\n      style =\n        [ ( \"display\", \"flex\" ) ]\n\n      content =\n        case model.selection of\n          Nothing ->\n            [ viewPlaceholder\n            , viewChartMain model\n            ]\n\n          Just selection ->\n            if selection.xStart == selection.xEnd then\n              [ viewPlaceholder\n              , viewChartMain model\n              ]\n            else\n              [ viewChartZoom model selection\n              , viewChartMain model\n              ]\n    in\n    Html.div [ Html.Attributes.style style ] content\n\n\n  viewPlaceholder : Html.Html Msg\n  viewPlaceholder =\n    Html.div\n      [ Html.Attributes.style\n          [ ( \"margin\", \"40px 25px 30px 70px\" )\n          , ( \"width\", \"505px\" )\n          , ( \"height\", \"360px\" )\n          , ( \"background\", \"#4646461a\" )\n          , ( \"text-align\", \"center\" )\n          , ( \"line-height\", \"340px\" )\n          ]\n      ]\n      [ Html.text \"Select a range on the graph to the right!\" ]\n\n\n\n  -- MAIN CHART\n\n\n  viewChartMain : Model -> Html.Html Msg\n  viewChartMain model =\n    viewChart model.data\n      { range = Range.default\n      , junk = junkConfig model\n      , legends = Legends.default\n      , events = events\n      , width = 670\n      , margin = Container.Margin 30 100 60 70\n      , dots = Dots.custom (Dots.full 0)\n      , id = \"line-chart\"\n      }\n\n\n  events : Events.Config Datum Msg\n  events =\n    let\n      options bool =\n        { stopPropagation = True\n        , preventDefault = True\n        , catchOutsideChart = bool\n        }\n    in\n    Events.custom\n      [ Events.onWithOptions \"mousedown\"  (options False) Hold           Events.getData\n      , Events.onWithOptions \"mousemove\"  (options False) Move           Events.getData\n      , Events.onWithOptions \"mouseup\"    (options True)  Drop           Events.getData\n      , Events.onWithOptions \"mouseleave\" (options False) LeaveChart     Events.getData\n      , Events.onWithOptions \"mouseleave\" (options True)  LeaveContainer Events.getData\n      ]\n\n\n  junkConfig : Model -> Junk.Config Datum msg\n  junkConfig model =\n    Junk.custom <| \\system ->\n      { below = below system model.selection\n      , above = above system model.hovered\n      , html = []\n      }\n\n\n  below : Coordinate.System -> Maybe Selection -> List (Svg.Svg msg)\n  below system selection =\n    case selection of\n      Just { xStart, xEnd } ->\n        let\n          attributes =\n            [ Svg.Attributes.fill \"#4646461a\" ]\n\n          ( yStart, yEnd ) =\n            ( system.y.min, system.y.max )\n\n          viewSelection =\n            Junk.rectangle system attributes xStart xEnd yStart yEnd\n        in\n        [ viewSelection ]\n\n      Nothing ->\n        []\n\n\n  above : Coordinate.System -> Maybe Float -> List (Svg.Svg msg)\n  above system hovered =\n    case hovered of\n      Just hovered ->\n        [ Junk.vertical system [] hovered ]\n\n      Nothing ->\n        []\n\n\n\n  -- ZOOM CHART\n\n\n  viewChartZoom : Model -> Selection -> Html.Html Msg\n  viewChartZoom model selection =\n    viewChart model.data\n      { range = xAxisRangeConfig selection\n      , junk =\n          Junk.hoverOne model.hinted\n            [ ( \"x\", toString << round100 << .x )\n            , ( \"y\", toString << round100 << .y )\n            ]\n      , events = Events.hoverOne Hint\n      , legends = Legends.none\n      , dots = Dots.hoverOne model.hinted\n      , width = 600\n      , margin = Container.Margin 30 25 60 70\n      , id = \"line-chart-zoom\"\n      }\n\n\n  xAxisRangeConfig : Selection -> Range.Config\n  xAxisRangeConfig selection =\n    let\n      xStart =\n        min selection.xStart selection.xEnd\n\n      xEnd =\n        max selection.xStart selection.xEnd\n    in\n    Range.window xStart xEnd\n\n\n\n\n  -- VIEW CHART\n\n\n  type alias Config =\n    { range : Range.Config\n    , junk : Junk.Config Datum Msg\n    , events : Events.Config Datum Msg\n    , legends : Legends.Config Datum Msg\n    , dots : Dots.Config Datum\n    , margin : Container.Margin\n    , width : Int\n    , id : String\n    }\n\n\n  viewChart : Data -> Config -> Html.Html Msg\n  viewChart data { range, junk, events, legends, dots, width, margin, id } =\n    LineChart.viewCustom\n      { y = Axis.default 450 \"y\" .y\n      , x =\n          Axis.custom\n            { title = Title.default \"x\"\n            , variable = Just << .x\n            , pixels = width\n            , range = range\n            , axisLine = AxisLine.rangeFrame Colors.gray\n            , ticks = Ticks.float 5\n            }\n      , container =\n          Container.custom\n            { attributesHtml = [ Html.Attributes.style [ ( \"display\", \"inline-block\" ) ] ]\n            , attributesSvg = []\n            , size = Container.static\n            , margin = margin\n            , id = \"chart-id\"\n            }\n      , interpolation = Interpolation.monotone\n      , intersection = Intersection.default\n      , legends = legends\n      , events = events\n      , junk = junk\n      , grid = Grid.default\n      , area = Area.default\n      , line = Line.default\n      , dots = dots\n      }\n      [ LineChart.line Colors.pink Dots.circle \"Nora\" data.nora\n      , LineChart.line Colors.cyan Dots.circle \"Noah\" data.noah\n      , LineChart.line Colors.blue Dots.circle \"Nina\" data.nina\n      ]\n\n\n\n  -- UTILS\n\n\n  round100 : Float -> Float\n  round100 float =\n    toFloat (round (float * 100)) / 100\n\n\n  ';
var _user$project$Selection$round100 = function ($float) {
	return _elm_lang$core$Basics$toFloat(
		_elm_lang$core$Basics$round($float * 100)) / 100;
};
var _user$project$Selection$viewChart = F2(
	function (data, _p0) {
		var _p1 = _p0;
		var containerStyles = {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'display', _1: 'inline-block'},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'width', _1: '50%'},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'height', _1: '100%'},
					_1: {ctor: '[]'}
				}
			}
		};
		return A2(
			_user$project$LineChart$viewCustom,
			{
				y: _user$project$LineChart_Axis$custom(
					{
						title: A3(_user$project$LineChart_Axis_Title$atAxisMax, 10, 0, 'displ.'),
						variable: function (_p2) {
							return _elm_lang$core$Maybe$Just(
								function (_) {
									return _.displacement;
								}(_p2));
						},
						pixels: 450,
						range: A2(_user$project$LineChart_Axis_Range$padded, 20, 20),
						axisLine: _user$project$LineChart_Axis_Line$rangeFrame(_user$project$LineChart_Colors$gray),
						ticks: _user$project$LineChart_Axis_Ticks$float(5)
					}),
				x: _user$project$LineChart_Axis$custom(
					{
						title: _user$project$LineChart_Axis_Title$default('time'),
						variable: function (_p3) {
							return _elm_lang$core$Maybe$Just(
								function (_) {
									return _.time;
								}(_p3));
						},
						pixels: _p1.width,
						range: _p1.range,
						axisLine: _user$project$LineChart_Axis_Line$rangeFrame(_user$project$LineChart_Colors$gray),
						ticks: _user$project$LineChart_Axis_Ticks$time(5)
					}),
				container: _user$project$LineChart_Container$custom(
					{
						attributesHtml: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(containerStyles),
							_1: {ctor: '[]'}
						},
						attributesSvg: {ctor: '[]'},
						size: _user$project$LineChart_Container$static,
						margin: _p1.margin,
						id: _p1.id
					}),
				interpolation: _user$project$LineChart_Interpolation$monotone,
				intersection: _user$project$LineChart_Axis_Intersection$default,
				legends: _p1.legends,
				events: _p1.events,
				junk: _p1.junk,
				grid: _user$project$LineChart_Grid$default,
				area: _user$project$LineChart_Area$default,
				line: _user$project$LineChart_Line$default,
				dots: _p1.dots
			},
			{
				ctor: '::',
				_0: A4(_user$project$LineChart$line, _user$project$LineChart_Colors$pink, _user$project$LineChart_Dots$circle, 'San Jose', data.sanJose),
				_1: {
					ctor: '::',
					_0: A4(_user$project$LineChart$line, _user$project$LineChart_Colors$cyan, _user$project$LineChart_Dots$circle, 'San Fransisco', data.sanFransisco),
					_1: {
						ctor: '::',
						_0: A4(_user$project$LineChart$line, _user$project$LineChart_Colors$blue, _user$project$LineChart_Dots$circle, 'San Diego', data.sanDiego),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _user$project$Selection$formatY = function (datum) {
	return _elm_lang$core$Basics$toString(
		_user$project$Selection$round100(datum.displacement));
};
var _user$project$Selection$formatX = function (datum) {
	return A2(
		_mgold$elm_date_format$Date_Format$format,
		'%l:%M%P, %e. %b, %Y',
		_elm_lang$core$Date$fromTime(datum.time));
};
var _user$project$Selection$xAxisRangeConfig = function (selection) {
	var xEnd = A2(_elm_lang$core$Basics$max, selection.xStart, selection.xEnd);
	var xStart = A2(_elm_lang$core$Basics$min, selection.xStart, selection.xEnd);
	return A2(_user$project$LineChart_Axis_Range$window, xStart, xEnd);
};
var _user$project$Selection$title = function (system) {
	return A8(_user$project$LineChart_Junk$labelAt, system, system.x.max, system.y.max, 20, -5, 'start', _user$project$LineChart_Colors$black, 'Earthquake in');
};
var _user$project$Selection$above = F2(
	function (system, hovered) {
		var _p4 = hovered;
		if (_p4.ctor === 'Just') {
			return {
				ctor: '::',
				_0: A3(
					_user$project$LineChart_Junk$vertical,
					system,
					{ctor: '[]'},
					_p4._0),
				_1: {
					ctor: '::',
					_0: _user$project$Selection$title(system),
					_1: {ctor: '[]'}
				}
			};
		} else {
			return {
				ctor: '::',
				_0: _user$project$Selection$title(system),
				_1: {ctor: '[]'}
			};
		}
	});
var _user$project$Selection$below = F2(
	function (system, selection) {
		var _p5 = selection;
		if (_p5.ctor === 'Just') {
			var _p6 = {ctor: '_Tuple2', _0: system.y.min, _1: system.y.max};
			var yStart = _p6._0;
			var yEnd = _p6._1;
			var attributes = {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$fill('#4646461a'),
				_1: {ctor: '[]'}
			};
			var viewSelection = A6(_user$project$LineChart_Junk$rectangle, system, attributes, _p5._0.xStart, _p5._0.xEnd, yStart, yEnd);
			return {
				ctor: '::',
				_0: viewSelection,
				_1: {ctor: '[]'}
			};
		} else {
			return {ctor: '[]'};
		}
	});
var _user$project$Selection$junkConfig = function (model) {
	return _user$project$LineChart_Junk$custom(
		function (system) {
			return {
				below: A2(_user$project$Selection$below, system, model.selection),
				above: A2(_user$project$Selection$above, system, model.hovered),
				html: {ctor: '[]'}
			};
		});
};
var _user$project$Selection$viewPlaceholderText = A2(
	_elm_lang$html$Html$div,
	{
		ctor: '::',
		_0: _elm_lang$html$Html_Attributes$class('view__selection__placeholder__inner__text'),
		_1: {ctor: '[]'}
	},
	{
		ctor: '::',
		_0: _elm_lang$html$Html$text('Select a range on the chart to the right!'),
		_1: {ctor: '[]'}
	});
var _user$project$Selection$viewInnerPlaceholder = A2(
	_elm_lang$html$Html$div,
	{
		ctor: '::',
		_0: _elm_lang$html$Html_Attributes$class('view__selection__placeholder__inner'),
		_1: {ctor: '[]'}
	},
	{
		ctor: '::',
		_0: _user$project$Selection$viewPlaceholderText,
		_1: {ctor: '[]'}
	});
var _user$project$Selection$viewPlaceholder = A2(
	_elm_lang$html$Html$div,
	{
		ctor: '::',
		_0: _elm_lang$html$Html_Attributes$class('view__selection__placeholder'),
		_1: {ctor: '[]'}
	},
	{
		ctor: '::',
		_0: _user$project$Selection$viewInnerPlaceholder,
		_1: {ctor: '[]'}
	});
var _user$project$Selection$addCmd = F2(
	function (cmd, model) {
		return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
	});
var _user$project$Selection$getSelectionXStart = F2(
	function (hovered, model) {
		var _p7 = model.selection;
		if (_p7.ctor === 'Just') {
			return _p7._0.xStart;
		} else {
			return hovered;
		}
	});
var _user$project$Selection$setHint = F2(
	function (hinted, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{hinted: hinted});
	});
var _user$project$Selection$setHovered = F2(
	function (hovered, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{hovered: hovered});
	});
var _user$project$Selection$setDragging = F2(
	function (dragging, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{dragging: dragging});
	});
var _user$project$Selection$setSelection = F2(
	function (selection, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{selection: selection});
	});
var _user$project$Selection$setData = F2(
	function (data, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{data: data});
	});
var _user$project$Selection$indexToTime = function (index) {
	return ((((_elm_lang$core$Time$hour * 24) * 365) * 45) + ((_elm_lang$core$Time$hour * 24) * 30)) + ((_elm_lang$core$Time$minute * 15) * _elm_lang$core$Basics$toFloat(index));
};
var _user$project$Selection$Model = F5(
	function (a, b, c, d, e) {
		return {data: a, hovered: b, selection: c, dragging: d, hinted: e};
	});
var _user$project$Selection$Selection = F2(
	function (a, b) {
		return {xStart: a, xEnd: b};
	});
var _user$project$Selection$update = F2(
	function (msg, model) {
		var _p8 = msg;
		switch (_p8.ctor) {
			case 'RecieveData':
				return A2(
					_user$project$Selection$addCmd,
					_elm_lang$core$Platform_Cmd$none,
					A2(_user$project$Selection$setData, _p8._0, model));
			case 'Hold':
				return A2(
					_user$project$Selection$addCmd,
					_elm_lang$core$Platform_Cmd$none,
					A2(
						_user$project$Selection$setDragging,
						true,
						A2(_user$project$Selection$setSelection, _elm_lang$core$Maybe$Nothing, model)));
			case 'Move':
				var _p9 = _p8._0;
				if (model.dragging) {
					var start = A2(_user$project$Selection$getSelectionXStart, _p9.x, model);
					var newSelection = A2(_user$project$Selection$Selection, start, _p9.x);
					return A2(
						_user$project$Selection$addCmd,
						_elm_lang$core$Platform_Cmd$none,
						A2(
							_user$project$Selection$setHovered,
							_elm_lang$core$Maybe$Just(_p9.x),
							A2(
								_user$project$Selection$setSelection,
								_elm_lang$core$Maybe$Just(newSelection),
								model)));
				} else {
					return A2(
						_user$project$Selection$addCmd,
						_elm_lang$core$Platform_Cmd$none,
						A2(
							_user$project$Selection$setHovered,
							_elm_lang$core$Maybe$Just(_p9.x),
							model));
				}
			case 'Drop':
				var _p10 = _p8._0;
				return _elm_lang$core$Native_Utils.eq(
					_p10.x,
					A2(_user$project$Selection$getSelectionXStart, _p10.x, model)) ? A2(
					_user$project$Selection$addCmd,
					_elm_lang$core$Platform_Cmd$none,
					A2(
						_user$project$Selection$setDragging,
						false,
						A2(_user$project$Selection$setSelection, _elm_lang$core$Maybe$Nothing, model))) : A2(
					_user$project$Selection$addCmd,
					_elm_lang$core$Platform_Cmd$none,
					A2(_user$project$Selection$setDragging, false, model));
			case 'LeaveChart':
				return A2(
					_user$project$Selection$addCmd,
					_elm_lang$core$Platform_Cmd$none,
					A2(_user$project$Selection$setHovered, _elm_lang$core$Maybe$Nothing, model));
			case 'LeaveContainer':
				return A2(
					_user$project$Selection$addCmd,
					_elm_lang$core$Platform_Cmd$none,
					A2(
						_user$project$Selection$setHovered,
						_elm_lang$core$Maybe$Nothing,
						A2(_user$project$Selection$setDragging, false, model)));
			default:
				return A2(
					_user$project$Selection$addCmd,
					_elm_lang$core$Platform_Cmd$none,
					A2(_user$project$Selection$setHint, _p8._0, model));
		}
	});
var _user$project$Selection$Data = F3(
	function (a, b, c) {
		return {sanJose: a, sanDiego: b, sanFransisco: c};
	});
var _user$project$Selection$Datum = F2(
	function (a, b) {
		return {time: a, displacement: b};
	});
var _user$project$Selection$toData = function (numbers) {
	var toDatum = F2(
		function (index, displacement) {
			return A2(
				_user$project$Selection$Datum,
				_user$project$Selection$indexToTime(index),
				displacement);
		});
	return A2(_elm_lang$core$List$indexedMap, toDatum, numbers);
};
var _user$project$Selection$Config = F8(
	function (a, b, c, d, e, f, g, h) {
		return {range: a, junk: b, events: c, legends: d, dots: e, margin: f, width: g, id: h};
	});
var _user$project$Selection$Hint = function (a) {
	return {ctor: 'Hint', _0: a};
};
var _user$project$Selection$viewChartZoom = F2(
	function (model, selection) {
		return A2(
			_user$project$Selection$viewChart,
			model.data,
			{
				range: _user$project$Selection$xAxisRangeConfig(selection),
				junk: A2(
					_user$project$LineChart_Junk$hoverOne,
					model.hinted,
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'time', _1: _user$project$Selection$formatX},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'displacement', _1: _user$project$Selection$formatY},
							_1: {ctor: '[]'}
						}
					}),
				events: _user$project$LineChart_Events$hoverOne(_user$project$Selection$Hint),
				legends: _user$project$LineChart_Legends$none,
				dots: _user$project$LineChart_Dots$hoverOne(model.hinted),
				width: 670,
				margin: A4(_user$project$LineChart_Container$Margin, 30, 60, 30, 75),
				id: 'line-chart-zoom'
			});
	});
var _user$project$Selection$LeaveContainer = function (a) {
	return {ctor: 'LeaveContainer', _0: a};
};
var _user$project$Selection$LeaveChart = function (a) {
	return {ctor: 'LeaveChart', _0: a};
};
var _user$project$Selection$Drop = function (a) {
	return {ctor: 'Drop', _0: a};
};
var _user$project$Selection$Move = function (a) {
	return {ctor: 'Move', _0: a};
};
var _user$project$Selection$Hold = function (a) {
	return {ctor: 'Hold', _0: a};
};
var _user$project$Selection$events = function () {
	var options = function (bool) {
		return {stopPropagation: true, preventDefault: true, catchOutsideChart: bool};
	};
	return _user$project$LineChart_Events$custom(
		{
			ctor: '::',
			_0: A4(
				_user$project$LineChart_Events$onWithOptions,
				'mousedown',
				options(false),
				_user$project$Selection$Hold,
				_user$project$LineChart_Events$getData),
			_1: {
				ctor: '::',
				_0: A4(
					_user$project$LineChart_Events$onWithOptions,
					'mousemove',
					options(false),
					_user$project$Selection$Move,
					_user$project$LineChart_Events$getData),
				_1: {
					ctor: '::',
					_0: A4(
						_user$project$LineChart_Events$onWithOptions,
						'mouseup',
						options(true),
						_user$project$Selection$Drop,
						_user$project$LineChart_Events$getData),
					_1: {
						ctor: '::',
						_0: A4(
							_user$project$LineChart_Events$onWithOptions,
							'mouseleave',
							options(false),
							_user$project$Selection$LeaveChart,
							_user$project$LineChart_Events$getData),
						_1: {
							ctor: '::',
							_0: A4(
								_user$project$LineChart_Events$onWithOptions,
								'mouseleave',
								options(true),
								_user$project$Selection$LeaveContainer,
								_user$project$LineChart_Events$getData),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
}();
var _user$project$Selection$viewChartMain = function (model) {
	return A2(
		_user$project$Selection$viewChart,
		model.data,
		{
			range: _user$project$LineChart_Axis_Range$default,
			junk: _user$project$Selection$junkConfig(model),
			legends: _user$project$LineChart_Legends$default,
			events: _user$project$Selection$events,
			width: 670,
			margin: A4(_user$project$LineChart_Container$Margin, 30, 165, 30, 70),
			dots: _user$project$LineChart_Dots$custom(
				_user$project$LineChart_Dots$full(0)),
			id: 'line-chart-selection-main'
		});
};
var _user$project$Selection$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		function () {
			var _p11 = model.selection;
			if (_p11.ctor === 'Nothing') {
				return {
					ctor: '::',
					_0: _user$project$Selection$viewPlaceholder,
					_1: {
						ctor: '::',
						_0: _user$project$Selection$viewChartMain(model),
						_1: {ctor: '[]'}
					}
				};
			} else {
				var _p12 = _p11._0;
				return _elm_lang$core$Native_Utils.eq(_p12.xStart, _p12.xEnd) ? {
					ctor: '::',
					_0: _user$project$Selection$viewPlaceholder,
					_1: {
						ctor: '::',
						_0: _user$project$Selection$viewChartMain(model),
						_1: {ctor: '[]'}
					}
				} : {
					ctor: '::',
					_0: A2(_user$project$Selection$viewChartZoom, model, _p12),
					_1: {
						ctor: '::',
						_0: _user$project$Selection$viewChartMain(model),
						_1: {ctor: '[]'}
					}
				};
			}
		}());
};
var _user$project$Selection$RecieveData = function (a) {
	return {ctor: 'RecieveData', _0: a};
};
var _user$project$Selection$generateData = function () {
	var compile = F3(
		function (a, b, c) {
			return A3(
				_user$project$Selection$Data,
				_user$project$Selection$toData(a),
				_user$project$Selection$toData(b),
				_user$project$Selection$toData(c));
		});
	var genNumbers = F2(
		function (min, max) {
			return A2(
				_elm_lang$core$Random$list,
				201,
				A2(_elm_lang$core$Random$float, min, max));
		});
	return A2(
		_user$project$Random_Pipeline$send,
		_user$project$Selection$RecieveData,
		A2(
			_user$project$Random_Pipeline$with,
			A2(genNumbers, -8, 8),
			A2(
				_user$project$Random_Pipeline$with,
				A2(genNumbers, -7, 7),
				A2(
					_user$project$Random_Pipeline$with,
					A2(genNumbers, -10, 10),
					_user$project$Random_Pipeline$generate(compile)))));
}();
var _user$project$Selection$init = {
	ctor: '_Tuple2',
	_0: {
		data: A3(
			_user$project$Selection$Data,
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'}),
		hovered: _elm_lang$core$Maybe$Nothing,
		selection: _elm_lang$core$Maybe$Nothing,
		dragging: false,
		hinted: _elm_lang$core$Maybe$Nothing
	},
	_1: _user$project$Selection$generateData
};
var _user$project$Selection$main = _elm_lang$html$Html$program(
	{
		init: _user$project$Selection$init,
		update: _user$project$Selection$update,
		view: _user$project$Selection$view,
		subscriptions: _elm_lang$core$Basics$always(_elm_lang$core$Platform_Sub$none)
	})();

var _user$project$Stepped$source = '\n\n  -- MODEL\n\n\n  type alias Model =\n    { data : Data\n    , hinted : Maybe Coordinate.Point\n    }\n\n\n  type alias Data =\n    { nora : List Coordinate.Point\n    , noah : List Coordinate.Point\n    , nina : List Coordinate.Point\n    }\n\n\n\n  -- INIT\n\n\n  init : ( Model, Cmd Msg )\n  init =\n    ( { data = Data [] [] []\n      , hinted = Nothing\n      }\n    , getNumbers\n    )\n\n\n  getNumbers : Cmd Msg\n  getNumbers =\n    let\n      genNumbers =\n        Random.list 30 (Random.int -70 100)\n    in\n    Random.map3 (,,) genNumbers genNumbers genNumbers\n      |> Random.generate RecieveNumbers\n\n\n\n  -- API\n\n\n  setData : ( List Int, List Int, List Int ) -> Model -> Model\n  setData ( n1, n2, n3 ) model =\n    { model | data = Data (toData n1) (toData n2) (toData n3) }\n\n\n  toData : List Int -> List Coordinate.Point\n  toData numbers =\n    List.indexedMap (\\i n -> Coordinate.Point (toDate i) (toFloat n)) numbers\n\n\n  toDate : Int -> Time.Time\n  toDate index =\n    Time.hour * 24 * 356 * 45 + Time.hour * 24 * toFloat index\n\n\n  setHint : Maybe Coordinate.Point -> Model -> Model\n  setHint hinted model =\n    { model | hinted = hinted }\n\n\n\n  -- UPDATE\n\n\n  type Msg\n    = RecieveNumbers ( List Int, List Int, List Int )\n    | Hint (Maybe Coordinate.Point)\n\n\n  update : Msg -> Model -> ( Model, Cmd Msg )\n  update msg model =\n    case msg of\n      RecieveNumbers numbers ->\n        model\n          |> setData numbers\n          |> addCmd Cmd.none\n\n      Hint point ->\n        model\n          |> setHint point\n          |> addCmd Cmd.none\n\n\n  addCmd : Cmd Msg -> Model -> ( Model, Cmd Msg )\n  addCmd cmd model =\n    ( model, Cmd.none )\n\n\n\n  -- VIEW\n\n\n  view : Model -> Html.Html Msg\n  view model =\n    Html.div [] [ chart model ]\n\n\n\n  -- CHART\n\n\n  chart : Model -> Html.Html Msg\n  chart model =\n    LineChart.viewCustom\n      { y =\n          Axis.custom\n            { title = Title.default \"LoC\"\n            , variable = Just << .y\n            , pixels = 450\n            , range = Range.padded 20 20\n            , axisLine = AxisLine.full Colors.gray\n            , ticks = Ticks.float 8\n            }\n      , x =\n          Axis.custom\n            { title = Title.default \"Time\"\n            , variable = Just << .x\n            , pixels = 1270\n            , range = Range.padded 20 20\n            , axisLine = AxisLine.full Colors.gray\n            , ticks = Ticks.time 10\n            }\n      , container = Container.spaced \"line-chart-area\" 30 100 60 70\n      , interpolation = Interpolation.stepped\n      , intersection = Intersection.default\n      , legends = Legends.default\n      , events = Events.hoverMany (Hint << List.head)\n      , junk =\n          case model.hinted of\n            Nothing ->\n              Junk.default\n\n            Just hinted ->\n              Junk.custom <| \\system ->\n                { below = [ Junk.vertical system [] hinted.x ]\n                , above = []\n                , html  = [ Junk.hoverAt system hinted.x system.y.max [] (viewHint hinted) ]\n                }\n      , grid = Grid.default\n      , area = Area.normal 0.5\n      , line = Line.default\n      , dots = Dots.custom (Dots.empty 5 1)\n      }\n      [ LineChart.line Colors.pink Dots.circle \"Nora\" model.data.nora ]\n\n\n  viewHint :  Coordinate.Point -> List (Html.Html msg)\n  viewHint { x, y } =\n    let\n      xString =\n         Date.Format.format \"%e. %b, %Y\" (Date.fromTime x)\n\n      pStyle other =\n        Html.Attributes.style <| ( \"margin\", \"3px\" ) :: other\n\n      ( loCStyle, loC ) =\n          if y == 0 then\n           ( [ ( \"color\", \"black\" ) ]\n           , \"0\"\n           )\n          else if y < 0 then\n           ( [ ( \"color\", Color.Convert.colorToHex Colors.red ) ]\n           , toString y\n           )\n          else\n           ( [ ( \"color\", Color.Convert.colorToHex Colors.green ) ]\n           , \"+\" ++ toString y\n           )\n    in\n    [ Html.p\n        [ pStyle\n            [ ( \"border-bottom\", \"1px solid rgb(163, 163, 163)\" )\n            , ( \"padding-bottom\", \"3px\" )\n            , ( \"margin-bottom\", \"5px\" )\n            ]\n        ]\n        [ Html.text xString ]\n    , Html.p\n      [ pStyle [] ]\n      [ Html.span [ Html.Attributes.style loCStyle ] [ Html.text loC ]\n      , Html.span [] [ Html.text \" lines of code\" ]\n      ]\n    ]\n\n\n\n  -- UTILS\n\n\n  round100 : Float -> Float\n  round100 float =\n    toFloat (round (float * 100)) / 100\n  ';
var _user$project$Stepped$round100 = function ($float) {
	return _elm_lang$core$Basics$toFloat(
		_elm_lang$core$Basics$round($float * 100)) / 100;
};
var _user$project$Stepped$addCmd = F2(
	function (cmd, model) {
		return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
	});
var _user$project$Stepped$setHint = F2(
	function (hinted, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{hinted: hinted});
	});
var _user$project$Stepped$update = F2(
	function (msg, model) {
		var _p0 = msg;
		return A2(
			_user$project$Stepped$addCmd,
			_elm_lang$core$Platform_Cmd$none,
			A2(_user$project$Stepped$setHint, _p0._0, model));
	});
var _user$project$Stepped$Model = F2(
	function (a, b) {
		return {data: a, hinted: b};
	});
var _user$project$Stepped$Data = F2(
	function (a, b) {
		return {year: a, price: b};
	});
var _user$project$Stepped$initData = {
	ctor: '::',
	_0: A2(_user$project$Stepped$Data, 1980, 0.12),
	_1: {
		ctor: '::',
		_0: A2(_user$project$Stepped$Data, 1981, 0.14),
		_1: {
			ctor: '::',
			_0: A2(_user$project$Stepped$Data, 1982, 0.155),
			_1: {
				ctor: '::',
				_0: A2(_user$project$Stepped$Data, 1983, 0.16),
				_1: {
					ctor: '::',
					_0: A2(_user$project$Stepped$Data, 1984, 0.17),
					_1: {
						ctor: '::',
						_0: A2(_user$project$Stepped$Data, 1985, 0.17),
						_1: {
							ctor: '::',
							_0: A2(_user$project$Stepped$Data, 1986, 0.18),
							_1: {
								ctor: '::',
								_0: A2(_user$project$Stepped$Data, 1987, 0.18),
								_1: {
									ctor: '::',
									_0: A2(_user$project$Stepped$Data, 1988, 0.19),
									_1: {
										ctor: '::',
										_0: A2(_user$project$Stepped$Data, 1989, 0.2),
										_1: {
											ctor: '::',
											_0: A2(_user$project$Stepped$Data, 1990, 0.22),
											_1: {
												ctor: '::',
												_0: A2(_user$project$Stepped$Data, 1991, 0.24),
												_1: {
													ctor: '::',
													_0: A2(_user$project$Stepped$Data, 1992, 0.24),
													_1: {
														ctor: '::',
														_0: A2(_user$project$Stepped$Data, 1993, 0.25),
														_1: {
															ctor: '::',
															_0: A2(_user$project$Stepped$Data, 1994, 0.25),
															_1: {
																ctor: '::',
																_0: A2(_user$project$Stepped$Data, 1995, 0.25),
																_1: {
																	ctor: '::',
																	_0: A2(_user$project$Stepped$Data, 1996, 0.26),
																	_1: {
																		ctor: '::',
																		_0: A2(_user$project$Stepped$Data, 1997, 0.26),
																		_1: {
																			ctor: '::',
																			_0: A2(_user$project$Stepped$Data, 1998, 0.26),
																			_1: {
																				ctor: '::',
																				_0: A2(_user$project$Stepped$Data, 1999, 0.26),
																				_1: {
																					ctor: '::',
																					_0: A2(_user$project$Stepped$Data, 2000, 0.27),
																					_1: {
																						ctor: '::',
																						_0: A2(_user$project$Stepped$Data, 2001, 0.27),
																						_1: {
																							ctor: '::',
																							_0: A2(_user$project$Stepped$Data, 2002, 0.27),
																							_1: {
																								ctor: '::',
																								_0: A2(_user$project$Stepped$Data, 2003, 0.28),
																								_1: {
																									ctor: '::',
																									_0: A2(_user$project$Stepped$Data, 2004, 0.28),
																									_1: {
																										ctor: '::',
																										_0: A2(_user$project$Stepped$Data, 2005, 0.3),
																										_1: {
																											ctor: '::',
																											_0: A2(_user$project$Stepped$Data, 2006, 0.32),
																											_1: {
																												ctor: '::',
																												_0: A2(_user$project$Stepped$Data, 2007, 0.34),
																												_1: {
																													ctor: '::',
																													_0: A2(_user$project$Stepped$Data, 2008, 0.36),
																													_1: {
																														ctor: '::',
																														_0: A2(_user$project$Stepped$Data, 2009, 0.39),
																														_1: {
																															ctor: '::',
																															_0: A2(_user$project$Stepped$Data, 2010, 0.41),
																															_1: {
																																ctor: '::',
																																_0: A2(_user$project$Stepped$Data, 2011, 0.46),
																																_1: {
																																	ctor: '::',
																																	_0: A2(_user$project$Stepped$Data, 2012, 0.6),
																																	_1: {ctor: '[]'}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _user$project$Stepped$init = {
	ctor: '_Tuple2',
	_0: {data: _user$project$Stepped$initData, hinted: _elm_lang$core$Maybe$Nothing},
	_1: _elm_lang$core$Platform_Cmd$none
};
var _user$project$Stepped$Hint = function (a) {
	return {ctor: 'Hint', _0: a};
};
var _user$project$Stepped$chart = function (model) {
	return A2(
		_user$project$LineChart$viewCustom,
		{
			y: _user$project$LineChart_Axis$custom(
				{
					title: _user$project$LineChart_Axis_Title$default('price (£)'),
					variable: function (_p1) {
						return _elm_lang$core$Maybe$Just(
							function (_) {
								return _.price;
							}(_p1));
					},
					pixels: 380,
					range: A2(_user$project$LineChart_Axis_Range$padded, 20, 20),
					axisLine: _user$project$LineChart_Axis_Line$full(_user$project$LineChart_Colors$gray),
					ticks: _user$project$LineChart_Axis_Ticks$float(5)
				}),
			x: function () {
				var toDate = function (year) {
					return A7(_justinmimbs$elm_date_extra$Date_Extra$fromParts, year, _elm_lang$core$Date$Jan, 1, 0, 0, 0, 0);
				};
				return _user$project$LineChart_Axis$custom(
					{
						title: _user$project$LineChart_Axis_Title$default('Year'),
						variable: function (_p2) {
							return _elm_lang$core$Maybe$Just(
								_elm_lang$core$Date$toTime(
									toDate(
										function (_) {
											return _.year;
										}(_p2))));
						},
						pixels: 1270,
						range: A2(_user$project$LineChart_Axis_Range$padded, 20, 20),
						axisLine: _user$project$LineChart_Axis_Line$full(_user$project$LineChart_Colors$gray),
						ticks: _user$project$LineChart_Axis_Ticks$time(10)
					});
			}(),
			container: _user$project$LineChart_Container$custom(
				{
					attributesHtml: {ctor: '[]'},
					attributesSvg: {ctor: '[]'},
					size: _user$project$LineChart_Container$relative,
					margin: A4(_user$project$LineChart_Container$Margin, 30, 140, 30, 70),
					id: 'line-chart-stepped'
				}),
			interpolation: _user$project$LineChart_Interpolation$stepped,
			intersection: _user$project$LineChart_Axis_Intersection$default,
			legends: _user$project$LineChart_Legends$default,
			events: _user$project$LineChart_Events$hoverOne(_user$project$Stepped$Hint),
			junk: A2(
				_user$project$LineChart_Junk$hoverOne,
				model.hinted,
				{
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'year',
						_1: function (datum) {
							return _elm_lang$core$Basics$toString(datum.year);
						}
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'price',
							_1: function (datum) {
								return A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(datum.price),
									'£');
							}
						},
						_1: {ctor: '[]'}
					}
				}),
			grid: _user$project$LineChart_Grid$default,
			area: _user$project$LineChart_Area$default,
			line: _user$project$LineChart_Line$default,
			dots: function () {
				var styleIndividual = function (datum) {
					return _elm_lang$core$Native_Utils.eq(
						_elm_lang$core$Maybe$Just(datum),
						model.hinted) ? _user$project$LineChart_Dots$full(5) : A2(_user$project$LineChart_Dots$empty, 5, 1);
				};
				var styleLegend = function (_p3) {
					return A2(_user$project$LineChart_Dots$empty, 5, 1);
				};
				return _user$project$LineChart_Dots$customAny(
					{legend: styleLegend, individual: styleIndividual});
			}()
		},
		{
			ctor: '::',
			_0: A4(_user$project$LineChart$line, _user$project$LineChart_Colors$pink, _user$project$LineChart_Dots$circle, 'UK stamp', model.data),
			_1: {ctor: '[]'}
		});
};
var _user$project$Stepped$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _user$project$Stepped$chart(model),
			_1: {ctor: '[]'}
		});
};
var _user$project$Stepped$main = _elm_lang$html$Html$program(
	{
		init: _user$project$Stepped$init,
		update: _user$project$Stepped$update,
		view: _user$project$Stepped$view,
		subscriptions: _elm_lang$core$Basics$always(_elm_lang$core$Platform_Sub$none)
	})();

var _user$project$Ticks$round10 = function ($float) {
	return _elm_lang$core$Basics$toFloat(
		_elm_lang$core$Basics$round($float * 10)) / 10;
};
var _user$project$Ticks$gridless = F2(
	function (format, n) {
		return _user$project$LineChart_Axis_Tick$custom(
			{
				position: n,
				color: _user$project$LineChart_Colors$gray,
				width: 1,
				length: 5,
				grid: false,
				direction: _user$project$LineChart_Axis_Tick$negative,
				label: _elm_lang$core$Maybe$Just(
					A2(
						_user$project$LineChart_Junk$label,
						_user$project$LineChart_Colors$black,
						format(n)))
			});
	});
var _user$project$Ticks$opposite = F2(
	function (format, n) {
		return _user$project$LineChart_Axis_Tick$custom(
			{
				position: n,
				color: _user$project$LineChart_Colors$gray,
				width: 1,
				length: 5,
				grid: true,
				direction: _user$project$LineChart_Axis_Tick$positive,
				label: _elm_lang$core$Maybe$Just(
					A2(
						_user$project$LineChart_Junk$label,
						_user$project$LineChart_Colors$black,
						format(n)))
			});
	});
var _user$project$Ticks$ticksConfig = F3(
	function (toValue, format, maybeHovered) {
		var framing = function (range) {
			return A2(
				_elm_lang$core$List$map,
				_user$project$Ticks$gridless(format),
				{
					ctor: '::',
					_0: range.min,
					_1: {
						ctor: '::',
						_0: range.max,
						_1: {ctor: '[]'}
					}
				});
		};
		var hoverOne = function () {
			var _p0 = maybeHovered;
			if (_p0.ctor === 'Just') {
				return {
					ctor: '::',
					_0: A2(
						_user$project$Ticks$opposite,
						format,
						toValue(_p0._0)),
					_1: {ctor: '[]'}
				};
			} else {
				return {ctor: '[]'};
			}
		}();
		return _user$project$LineChart_Axis_Ticks$custom(
			F2(
				function (dataRange, axisRange) {
					return A2(
						_elm_lang$core$Basics_ops['++'],
						framing(dataRange),
						hoverOne);
				}));
	});
var _user$project$Ticks$yAxisConfig = function (model) {
	var formatY = function (_p1) {
		return _elm_lang$core$Basics$toString(
			_user$project$Ticks$round10(_p1));
	};
	return _user$project$LineChart_Axis$custom(
		{
			title: A3(_user$project$LineChart_Axis_Title$atAxisMax, 10, 0, 'Grade avg.'),
			variable: function (_p2) {
				return _elm_lang$core$Maybe$Just(
					function (_) {
						return _.y;
					}(_p2));
			},
			pixels: 450,
			range: A2(_user$project$LineChart_Axis_Range$padded, 50, 20),
			axisLine: _user$project$LineChart_Axis_Line$rangeFrame(_user$project$LineChart_Colors$gray),
			ticks: A3(
				_user$project$Ticks$ticksConfig,
				function (_) {
					return _.y;
				},
				formatY,
				model.hinted)
		});
};
var _user$project$Ticks$xAxisConfig = function (model) {
	var formatX = function (x) {
		return _elm_lang$core$Native_Utils.eq(x, 0) ? 'K' : _elm_lang$core$Basics$toString(x);
	};
	return _user$project$LineChart_Axis$custom(
		{
			title: _user$project$LineChart_Axis_Title$default('Year'),
			variable: function (_p3) {
				return _elm_lang$core$Maybe$Just(
					function (_) {
						return _.x;
					}(_p3));
			},
			pixels: 800,
			range: A2(_user$project$LineChart_Axis_Range$padded, 50, 20),
			axisLine: _user$project$LineChart_Axis_Line$rangeFrame(_user$project$LineChart_Colors$gray),
			ticks: A3(
				_user$project$Ticks$ticksConfig,
				function (_) {
					return _.x;
				},
				formatX,
				model.hinted)
		});
};
var _user$project$Ticks$addCmd = F2(
	function (cmd, model) {
		return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
	});
var _user$project$Ticks$setHint = F2(
	function (hinted, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{hinted: hinted});
	});
var _user$project$Ticks$toData = function (numbers) {
	return A2(
		_elm_lang$core$List$indexedMap,
		function (i) {
			return _user$project$LineChart_Coordinate$Point(
				_elm_lang$core$Basics$toFloat(i));
		},
		numbers);
};
var _user$project$Ticks$Model = F2(
	function (a, b) {
		return {data: a, hinted: b};
	});
var _user$project$Ticks$Data = F3(
	function (a, b, c) {
		return {nora: a, noah: b, nina: c};
	});
var _user$project$Ticks$setData = F2(
	function (_p4, model) {
		var _p5 = _p4;
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				data: A3(
					_user$project$Ticks$Data,
					_user$project$Ticks$toData(_p5._0),
					_user$project$Ticks$toData(_p5._1),
					_user$project$Ticks$toData(_p5._2))
			});
	});
var _user$project$Ticks$update = F2(
	function (msg, model) {
		var _p6 = msg;
		if (_p6.ctor === 'RecieveNumbers') {
			return A2(
				_user$project$Ticks$addCmd,
				_elm_lang$core$Platform_Cmd$none,
				A2(_user$project$Ticks$setData, _p6._0, model));
		} else {
			return A2(
				_user$project$Ticks$addCmd,
				_elm_lang$core$Platform_Cmd$none,
				A2(_user$project$Ticks$setHint, _p6._0, model));
		}
	});
var _user$project$Ticks$Hint = function (a) {
	return {ctor: 'Hint', _0: a};
};
var _user$project$Ticks$chart = function (model) {
	return A2(
		_user$project$LineChart$viewCustom,
		{
			x: _user$project$Ticks$xAxisConfig(model),
			y: _user$project$Ticks$yAxisConfig(model),
			container: _user$project$LineChart_Container$custom(
				{
					attributesHtml: {ctor: '[]'},
					attributesSvg: {ctor: '[]'},
					size: _user$project$LineChart_Container$relative,
					margin: A4(_user$project$LineChart_Container$Margin, 60, 100, 30, 70),
					id: 'line-chart-ticks'
				}),
			interpolation: _user$project$LineChart_Interpolation$default,
			intersection: _user$project$LineChart_Axis_Intersection$default,
			legends: _user$project$LineChart_Legends$default,
			events: _user$project$LineChart_Events$hoverOne(_user$project$Ticks$Hint),
			junk: _user$project$LineChart_Junk$default,
			grid: _user$project$LineChart_Grid$default,
			area: _user$project$LineChart_Area$default,
			line: _user$project$LineChart_Line$default,
			dots: _user$project$LineChart_Dots$custom(
				A2(_user$project$LineChart_Dots$disconnected, 7, 2))
		},
		{
			ctor: '::',
			_0: A4(_user$project$LineChart$line, _user$project$LineChart_Colors$blue, _user$project$LineChart_Dots$plus, 'Nora', model.data.nora),
			_1: {
				ctor: '::',
				_0: A4(_user$project$LineChart$line, _user$project$LineChart_Colors$cyan, _user$project$LineChart_Dots$cross, 'Noah', model.data.noah),
				_1: {
					ctor: '::',
					_0: A5(
						_user$project$LineChart$dash,
						_user$project$LineChart_Colors$pink,
						_user$project$LineChart_Dots$none,
						'Class',
						{
							ctor: '::',
							_0: 5,
							_1: {
								ctor: '::',
								_0: 2,
								_1: {ctor: '[]'}
							}
						},
						model.data.nina),
					_1: {ctor: '[]'}
				}
			}
		});
};
var _user$project$Ticks$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _user$project$Ticks$chart(model),
			_1: {ctor: '[]'}
		});
};
var _user$project$Ticks$RecieveNumbers = function (a) {
	return {ctor: 'RecieveNumbers', _0: a};
};
var _user$project$Ticks$getNumbers = function () {
	var genNumbers = F2(
		function (min, max) {
			return A2(
				_elm_lang$core$Random$list,
				10,
				A2(_elm_lang$core$Random$float, min, max));
		});
	return A2(
		_elm_lang$core$Random$generate,
		_user$project$Ticks$RecieveNumbers,
		A4(
			_elm_lang$core$Random$map3,
			F3(
				function (v0, v1, v2) {
					return {ctor: '_Tuple3', _0: v0, _1: v1, _2: v2};
				}),
			A2(genNumbers, 9, 12),
			A2(genNumbers, 7, 10),
			A2(genNumbers, 2, 10)));
}();
var _user$project$Ticks$init = {
	ctor: '_Tuple2',
	_0: {
		data: A3(
			_user$project$Ticks$Data,
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'}),
		hinted: _elm_lang$core$Maybe$Nothing
	},
	_1: _user$project$Ticks$getNumbers
};
var _user$project$Ticks$main = _elm_lang$html$Html$program(
	{
		init: _user$project$Ticks$init,
		update: _user$project$Ticks$update,
		view: _user$project$Ticks$view,
		subscriptions: _elm_lang$core$Basics$always(_elm_lang$core$Platform_Sub$none)
	})();

var _user$project$Main$viewTitle = A2(
	_elm_lang$html$Html$div,
	{
		ctor: '::',
		_0: _elm_lang$html$Html_Attributes$class('view__title__container'),
		_1: {ctor: '[]'}
	},
	{
		ctor: '::',
		_0: A2(
			_elm_lang$html$Html$h1,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('view__title'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text('line-charts'),
				_1: {ctor: '[]'}
			}),
		_1: {
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('view__github-link'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$a,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$href('https://github.com/terezka/line-charts'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('Github'),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html$text(' / '),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$a,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$href('https://twitter.com/terezk_a'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Twitter'),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html$text(' / '),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$a,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$href('http://package.elm-lang.org/packages/terezka/line-charts/latest'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Docs'),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$p,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('view__tag-line'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('A opinionated library for plotting series in SVG.'),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$p,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('view__tag-line'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('Written in all Elm.'),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			}
		}
	});
var _user$project$Main$highlight = _elm_lang$core$Native_Platform.outgoingPort(
	'highlight',
	function (v) {
		return null;
	});
var _user$project$Main$setBodyScroll = _elm_lang$core$Native_Platform.outgoingPort(
	'setBodyScroll',
	function (v) {
		return v;
	});
var _user$project$Main$Model = F7(
	function (a, b, c, d, e, f, g) {
		return {focused: a, isSourceOpen: b, selection: c, area: d, stepped: e, ticks: f, lines: g};
	});
var _user$project$Main$LinesMsg = function (a) {
	return {ctor: 'LinesMsg', _0: a};
};
var _user$project$Main$TicksMsg = function (a) {
	return {ctor: 'TicksMsg', _0: a};
};
var _user$project$Main$SteppedMsg = function (a) {
	return {ctor: 'SteppedMsg', _0: a};
};
var _user$project$Main$AreaMsg = function (a) {
	return {ctor: 'AreaMsg', _0: a};
};
var _user$project$Main$SelectionMsg = function (a) {
	return {ctor: 'SelectionMsg', _0: a};
};
var _user$project$Main$init = function () {
	var _p0 = _user$project$Lines$init;
	var lines = _p0._0;
	var cmdLines = _p0._1;
	var _p1 = _user$project$Ticks$init;
	var ticks = _p1._0;
	var cmdTicks = _p1._1;
	var _p2 = _user$project$Stepped$init;
	var stepped = _p2._0;
	var cmdStepped = _p2._1;
	var _p3 = _user$project$Area$init;
	var area = _p3._0;
	var cmdArea = _p3._1;
	var _p4 = _user$project$Selection$init;
	var selection = _p4._0;
	var cmdSelection = _p4._1;
	return {
		ctor: '_Tuple2',
		_0: {focused: 0, isSourceOpen: false, selection: selection, area: area, stepped: stepped, ticks: ticks, lines: lines},
		_1: _elm_lang$core$Platform_Cmd$batch(
			{
				ctor: '::',
				_0: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Main$SelectionMsg, cmdSelection),
				_1: {
					ctor: '::',
					_0: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Main$AreaMsg, cmdArea),
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Main$SteppedMsg, cmdStepped),
						_1: {
							ctor: '::',
							_0: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Main$TicksMsg, cmdTicks),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Main$LinesMsg, cmdLines),
								_1: {
									ctor: '::',
									_0: _user$project$Main$highlight(
										{ctor: '_Tuple0'}),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			})
	};
}();
var _user$project$Main$update = F2(
	function (msg, model) {
		var _p5 = msg;
		switch (_p5.ctor) {
			case 'Focus':
				var _p6 = _p5._0;
				var isSourceOpen = (model.isSourceOpen && _elm_lang$core$Native_Utils.eq(model.focused, _p6)) ? false : ((!_elm_lang$core$Native_Utils.eq(model.focused, _p6)) ? true : (!model.isSourceOpen));
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{isSourceOpen: isSourceOpen, focused: _p6}),
					_1: _user$project$Main$setBodyScroll(isSourceOpen)
				};
			case 'CloseSource':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{isSourceOpen: false}),
					_1: _user$project$Main$setBodyScroll(false)
				};
			case 'SelectionMsg':
				var _p7 = A2(_user$project$Selection$update, _p5._0, model.selection);
				var selection = _p7._0;
				var cmd = _p7._1;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{selection: selection}),
					_1: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Main$SelectionMsg, cmd)
				};
			case 'AreaMsg':
				var _p8 = A2(_user$project$Area$update, _p5._0, model.area);
				var area = _p8._0;
				var cmd = _p8._1;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{area: area}),
					_1: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Main$AreaMsg, cmd)
				};
			case 'SteppedMsg':
				var _p9 = A2(_user$project$Stepped$update, _p5._0, model.stepped);
				var stepped = _p9._0;
				var cmd = _p9._1;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{stepped: stepped}),
					_1: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Main$SteppedMsg, cmd)
				};
			case 'TicksMsg':
				var _p10 = A2(_user$project$Ticks$update, _p5._0, model.ticks);
				var ticks = _p10._0;
				var cmd = _p10._1;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{ticks: ticks}),
					_1: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Main$TicksMsg, cmd)
				};
			default:
				var _p11 = A2(_user$project$Lines$update, _p5._0, model.lines);
				var lines = _p11._0;
				var cmd = _p11._1;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{lines: lines}),
					_1: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Main$LinesMsg, cmd)
				};
		}
	});
var _user$project$Main$CloseSource = {ctor: 'CloseSource'};
var _user$project$Main$viewSource = F2(
	function (id, isSourceOpen) {
		var viewInnerSource = F2(
			function (i, s) {
				return _elm_lang$core$Native_Utils.eq(i, id) ? A2(
					_elm_lang$html$Html$pre,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('shown'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(s),
						_1: {ctor: '[]'}
					}) : A2(
					_elm_lang$html$Html$pre,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('hidden'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(s),
						_1: {ctor: '[]'}
					});
			});
		var viewSources = A2(
			_elm_lang$core$List$indexedMap,
			viewInnerSource,
			{
				ctor: '::',
				_0: _user$project$Area$source,
				_1: {
					ctor: '::',
					_0: _user$project$Selection$source,
					_1: {
						ctor: '::',
						_0: _user$project$Lines$source,
						_1: {
							ctor: '::',
							_0: _user$project$Stepped$source,
							_1: {ctor: '[]'}
						}
					}
				}
			});
		var classes = isSourceOpen ? 'view__source__container view__source__container--open' : 'view__source__container view__source__container--closed';
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class(classes),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$button,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Events$onClick(_user$project$Main$CloseSource),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('[x] close'),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('view__source__inner elm'),
							_1: {ctor: '[]'}
						},
						viewSources),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Main$Focus = function (a) {
	return {ctor: 'Focus', _0: a};
};
var _user$project$Main$viewExample = F5(
	function (id, modifier, toMsg, view, model) {
		var $class = A2(_elm_lang$core$Basics_ops['++'], 'view__example__container view__example__container--', modifier);
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class($class),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$map,
					toMsg,
					A2(_elm_lang$html$Html_Lazy$lazy, view, model)),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$button,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('view__example__toggle-source'),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Events$onClick(
									_user$project$Main$Focus(id)),
								_1: {ctor: '[]'}
							}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('see source'),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Main$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('view'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _user$project$Main$viewTitle,
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('view__body'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A5(_user$project$Main$viewExample, 0, 'full', _user$project$Main$AreaMsg, _user$project$Area$view, model.area),
						_1: {
							ctor: '::',
							_0: A5(_user$project$Main$viewExample, 1, 'full', _user$project$Main$SelectionMsg, _user$project$Selection$view, model.selection),
							_1: {
								ctor: '::',
								_0: A5(_user$project$Main$viewExample, 2, 'full', _user$project$Main$LinesMsg, _user$project$Lines$view, model.lines),
								_1: {
									ctor: '::',
									_0: A5(_user$project$Main$viewExample, 3, 'full', _user$project$Main$SteppedMsg, _user$project$Stepped$view, model.stepped),
									_1: {ctor: '[]'}
								}
							}
						}
					}),
				_1: {
					ctor: '::',
					_0: A2(_user$project$Main$viewSource, model.focused, model.isSourceOpen),
					_1: {ctor: '[]'}
				}
			}
		});
};
var _user$project$Main$main = _elm_lang$html$Html$program(
	{
		init: _user$project$Main$init,
		update: _user$project$Main$update,
		subscriptions: _elm_lang$core$Basics$always(_elm_lang$core$Platform_Sub$none),
		view: _user$project$Main$view
	})();

var Elm = {};
Elm['Main'] = Elm['Main'] || {};
if (typeof _user$project$Main$main !== 'undefined') {
    _user$project$Main$main(Elm['Main'], 'Main', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

