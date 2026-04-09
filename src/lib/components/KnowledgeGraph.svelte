<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	type GraphNode = {
		id: string;
		label: string;
		type: 'source' | 'page' | 'catalyst' | 'entity' | 'topic';
		score?: number;
		meta?: string;
	};

	type GraphLink = {
		source: string;
		target: string;
		type: 'sourced_from' | 'references' | 'contradicts' | 'generates' | 'tagged';
	};

	let {
		sources = [],
		pages = [],
		catalysts = [],
		topicName = ''
	}: {
		sources: any[];
		pages: any[];
		catalysts: any[];
		topicName: string;
	} = $props();

	let container: HTMLDivElement;

	function buildGraph(): { nodes: GraphNode[]; links: GraphLink[] } {
		const nodes: GraphNode[] = [];
		const links: GraphLink[] = [];
		const entitySet = new Set<string>();

		// Topic node (center)
		nodes.push({
			id: 'topic',
			label: topicName,
			type: 'topic'
		});

		// Source nodes
		for (const src of sources) {
			nodes.push({
				id: `src-${src._id}`,
				label: src.title.length > 40 ? src.title.slice(0, 37) + '...' : src.title,
				type: 'source',
				score: src.resonanceScore,
				meta: src.youtubeChannelName
			});
			links.push({ source: 'topic', target: `src-${src._id}`, type: 'sourced_from' });

			// Extract channel as entity
			if (src.youtubeChannelName && !entitySet.has(src.youtubeChannelName)) {
				entitySet.add(src.youtubeChannelName);
				nodes.push({
					id: `ch-${src.youtubeChannelName}`,
					label: src.youtubeChannelName,
					type: 'entity',
					meta: 'channel'
				});
				links.push({ source: `ch-${src.youtubeChannelName}`, target: 'topic', type: 'tagged' });
			}
			if (src.youtubeChannelName) {
				links.push({
					source: `src-${src._id}`,
					target: `ch-${src.youtubeChannelName}`,
					type: 'tagged'
				});
			}
		}

		// Wiki page nodes
		for (const page of pages) {
			nodes.push({
				id: `page-${page._id}`,
				label: page.title,
				type: 'page'
			});
			links.push({ source: 'topic', target: `page-${page._id}`, type: 'references' });

			// Link pages to their sources
			for (const srcId of page.sourceIds ?? []) {
				const sourceNodeId = `src-${srcId}`;
				if (nodes.some((n) => n.id === sourceNodeId)) {
					links.push({ source: sourceNodeId, target: `page-${page._id}`, type: 'sourced_from' });
				}
			}

			// Entity tags from pages
			for (const tag of page.entityTags ?? []) {
				if (!entitySet.has(tag)) {
					entitySet.add(tag);
					nodes.push({ id: `ent-${tag}`, label: tag, type: 'entity' });
				}
				links.push({ source: `page-${page._id}`, target: `ent-${tag}`, type: 'tagged' });
			}

			// Contradiction edges
			for (const relId of page.relatedPages ?? []) {
				const targetId = `page-${relId}`;
				if (nodes.some((n) => n.id === targetId)) {
					links.push({ source: `page-${page._id}`, target: targetId, type: 'references' });
				}
			}
		}

		// Catalyst nodes
		for (const cat of catalysts) {
			nodes.push({
				id: `cat-${cat._id}`,
				label: cat.question.length > 50 ? cat.question.slice(0, 47) + '...' : cat.question,
				type: 'catalyst'
			});
			links.push({ source: 'topic', target: `cat-${cat._id}`, type: 'generates' });
		}

		return { nodes, links };
	}

	const colorMap: Record<string, string> = {
		topic: '#16a34a',
		source: '#3b82f6',
		page: '#8b5cf6',
		catalyst: '#f59e0b',
		entity: '#6b7280'
	};

	const sizeMap: Record<string, number> = {
		topic: 18,
		source: 8,
		page: 12,
		catalyst: 6,
		entity: 5
	};

	function renderGraph() {
		if (!container) return;
		const { nodes, links } = buildGraph();
		if (nodes.length === 0) return;

		// Clear previous
		d3.select(container).selectAll('*').remove();

		const width = container.clientWidth;
		const height = Math.max(400, Math.min(600, nodes.length * 15));

		const svg = d3
			.select(container)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [0, 0, width, height]);

		// Defs for arrows
		svg
			.append('defs')
			.selectAll('marker')
			.data(['sourced_from', 'references', 'contradicts', 'generates', 'tagged'])
			.join('marker')
			.attr('id', (d) => `arrow-${d}`)
			.attr('viewBox', '0 -5 10 10')
			.attr('refX', 20)
			.attr('refY', 0)
			.attr('markerWidth', 4)
			.attr('markerHeight', 4)
			.attr('orient', 'auto')
			.append('path')
			.attr('fill', (d) => (d === 'contradicts' ? '#ef4444' : '#d1d5db'))
			.attr('d', 'M0,-5L10,0L0,5');

		const simulation = d3
			.forceSimulation(nodes as any)
			.force(
				'link',
				d3
					.forceLink(links as any)
					.id((d: any) => d.id)
					.distance(80)
			)
			.force('charge', d3.forceManyBody().strength(-150))
			.force('center', d3.forceCenter(width / 2, height / 2))
			.force('collision', d3.forceCollide().radius(20));

		const linkElements = svg
			.append('g')
			.selectAll('line')
			.data(links)
			.join('line')
			.attr('stroke', (d) => (d.type === 'contradicts' ? '#ef4444' : '#e5e7eb'))
			.attr('stroke-width', (d) => (d.type === 'contradicts' ? 2 : 1))
			.attr('stroke-dasharray', (d) => (d.type === 'tagged' ? '3,3' : 'none'))
			.attr('marker-end', (d) => `url(#arrow-${d.type})`);

		const nodeGroup = svg
			.append('g')
			.selectAll('g')
			.data(nodes)
			.join('g')
			.call(
				d3
					.drag()
					.on('start', (event: any, d: any) => {
						if (!event.active) simulation.alphaTarget(0.3).restart();
						d.fx = d.x;
						d.fy = d.y;
					})
					.on('drag', (event: any, d: any) => {
						d.fx = event.x;
						d.fy = event.y;
					})
					.on('end', (event: any, d: any) => {
						if (!event.active) simulation.alphaTarget(0);
						d.fx = null;
						d.fy = null;
					}) as any
			);

		// Node circles
		nodeGroup
			.append('circle')
			.attr('r', (d: any) => {
				if (d.type === 'source' && d.score) {
					return Math.max(5, Math.min(14, d.score / 8));
				}
				return sizeMap[d.type] ?? 6;
			})
			.attr('fill', (d: any) => colorMap[d.type] ?? '#6b7280')
			.attr('stroke', '#fff')
			.attr('stroke-width', 1.5)
			.attr('opacity', 0.9);

		// Labels
		nodeGroup
			.append('text')
			.text((d: any) => d.label)
			.attr('dx', 12)
			.attr('dy', 4)
			.attr('font-size', (d: any) => (d.type === 'topic' ? '13px' : '10px'))
			.attr('font-weight', (d: any) => (d.type === 'topic' ? '700' : '400'))
			.attr('fill', '#6b7280')
			.attr('pointer-events', 'none');

		// Tooltip on hover
		nodeGroup.append('title').text((d: any) => {
			let t = d.label;
			if (d.score) t += `\nResonance: ${d.score}`;
			if (d.meta) t += `\n${d.meta}`;
			return t;
		});

		simulation.on('tick', () => {
			linkElements
				.attr('x1', (d: any) => d.source.x)
				.attr('y1', (d: any) => d.source.y)
				.attr('x2', (d: any) => d.target.x)
				.attr('y2', (d: any) => d.target.y);

			nodeGroup.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
		});
	}

	onMount(() => {
		renderGraph();
	});

	// Re-render when data changes
	$effect(() => {
		// Touch reactive deps
		sources;
		pages;
		catalysts;
		renderGraph();
	});
</script>

<div class="space-y-3">
	<!-- Legend -->
	<div class="flex flex-wrap gap-3 text-xs text-(--color-on-surface-muted)">
		<span class="flex items-center gap-1.5">
			<span class="w-3 h-3 rounded-full bg-green-600"></span> Topic
		</span>
		<span class="flex items-center gap-1.5">
			<span class="w-3 h-3 rounded-full bg-blue-500"></span> Source
		</span>
		<span class="flex items-center gap-1.5">
			<span class="w-3 h-3 rounded-full bg-purple-500"></span> Wiki Page
		</span>
		<span class="flex items-center gap-1.5">
			<span class="w-3 h-3 rounded-full bg-amber-500"></span> Catalyst
		</span>
		<span class="flex items-center gap-1.5">
			<span class="w-3 h-3 rounded-full bg-gray-500"></span> Entity
		</span>
	</div>

	<!-- Graph container -->
	<div
		bind:this={container}
		class="w-full bg-(--color-surface) rounded-xl border border-(--color-border) overflow-hidden"
	></div>

	{#if sources.length === 0 && pages.length === 0}
		<p class="text-xs text-(--color-on-surface-muted) text-center">
			Add sources to see the knowledge graph grow.
		</p>
	{/if}
</div>
