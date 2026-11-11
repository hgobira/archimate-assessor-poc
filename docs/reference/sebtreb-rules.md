# SebTreb rules — digest

Source: [resources/AS-SebTreb rules for ArchiMate modelling…pdf](../../resources/). These are internal STS style rules, named after Sebastian Trebaczkiewicz (EA lead 2020–2024). They are the Visual Clarity marking scheme.
Keywords follow RFC 2119 (MUST, SHOULD, MAY). They are guidelines: a rule may be challenged if following it makes a view less readable, and a client's own style guide takes precedence. A caveat of **N/A** means the rule is absolute.

The "Automatable?" column is our assessment against the Open Exchange XML, which has node x/y/w/h and connection bendpoints but no anchor points and no label positions.

## Elements

| ID | Level | Rule | Caveats | Automatable? |
|---|---|---|---|---|
| elm-001 | MUST | Elements use the rectangle notation | N/A | Partial: XML has no shape/figure info for most tools |
| elm-002 | SHOULD | Elements are the same size | Encapsulating element; spanning multiple elements aids clarity | Yes (size variance among non-container nodes) |
| elm-003 | SHOULD | Elements at the same level align horizontally and vertically and are evenly spaced | Offset to enable better routing | Yes (heuristic) |
| elm-004 | MUST | Elements are resized to align to the grid on all four sides | N/A | Yes (x, y, w, h multiples of the grid) |
| elm-005 | SHOULD | Spacing between elements is consistent (e.g. a 2 or 4 cell grid) | Offset for routing | Yes (heuristic) |
| elm-006 | MUST | Spacing between nested elements and their container is consistent | N/A | Yes (child offsets within parent) |
| elm-007 | MUST | Elements representing data entities are named in the singular | N/A | Heuristic (plural detection) |
| elm-008 | MUST | Labels on non-container elements are centred vertically and horizontally | N/A | No (no label alignment in XML) |
| elm-009 | SHOULD | Labels on container elements are at the top, centred, not obstructing lines; placement consistent across containers | If connectors cross the label: bottom-centre, or left/right side rotated anti-clockwise | No |

## Connectors

| ID | Level | Rule | Caveats | Automatable? |
|---|---|---|---|---|
| cnn-001 | MUST | Connectors are a single horizontal line, a single vertical line, or right-angled with rounded bends. Never diagonal. | N/A | Yes (every segment including the source and target ends) |
| cnn-002 | SHOULD | Connectors don't cross each other | Crossing is impossible to avoid, or avoiding it adds complexity | Yes (segment intersection, approximate endpoints) |
| cnn-003 | MUST | Connectors have the minimum number of bends | N/A | Heuristic (bend count against the minimum needed) |
| cnn-004 | MUST | Connectors run parallel to element edges, equidistant from sandwiching elements | N/A | Partial |
| cnn-005 | SHOULD | Labels sit on the horizontal part, centred (MUST be centred) | Vertical-only connector; part too short; label too long | No |
| cnn-006 | MUST | Labels on vertical connectors are rotated 90° anti-clockwise and centred | N/A | No |
| cnn-007 | SHOULD | Labels are not on a corner of a bent connector | Both parts too short | No |
| cnn-008 | SHOULD | Association connectors in data views show multiplicity; labels close to their entity | Directed=true used instead to indicate the "many" side | Partial (label presence only) |
| cnn-009 | MUST | Association labels in data views meaningfully describe the relationship | N/A | Partial (presence, not meaning) |
| cnn-010 | MUST | A single connector leaving a side attaches to the centre of the source | N/A | No (no anchor data) |
| cnn-011 | MUST | A single connector arriving at a side attaches to the centre of the target | N/A | No |
| cnn-012 | MUST | Multiple connectors leaving the same side are evenly spaced | N/A | No |
| cnn-013 | MUST | Multiple connectors arriving at the same side are evenly spaced | N/A | No |

## Views

| ID | Level | Rule | Automatable? |
|---|---|---|---|
| vws-001 | MUST | View names indicate whether the diagram is contextual, conceptual, logical or physical | Yes. Name-based by definition. |

## Miscellaneous

| ID | Level | Rule | Caveats | Automatable? |
|---|---|---|---|---|
| msc-001 | SHOULD | Note elements listing actions are sized so actions don't wrap | Very long action; no space | No |
| msc-002 | SHOULD | Use Grouping to reduce clutter when many elements share the same relationship | | No (judgement) |
| msc-003 | MUST | Grouped concepts are nested in the Grouping, with no explicit aggregation to the Grouping | | Yes |
| msc-004 | MUST | Don't use Grouping when a more appropriate element exists | | No (judgement) |
