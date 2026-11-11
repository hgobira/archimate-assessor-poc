// ===================== ARCHIMATE KNOWLEDGE BASE =====================

const ARCHIMATE_LAYERS = {
  Business: ['BusinessActor','BusinessRole','BusinessCollaboration','BusinessInterface',
    'BusinessProcess','BusinessFunction','BusinessInteraction','BusinessEvent',
    'BusinessService','BusinessObject','Contract','Representation','Product',
    'BusinessObject','Value','Meaning','Driver','Assessment','Goal','Outcome',
    'Principle','Requirement','Constraint'],
  Application: ['ApplicationComponent','ApplicationCollaboration','ApplicationInterface',
    'ApplicationProcess','ApplicationFunction','ApplicationInteraction','ApplicationEvent',
    'ApplicationService','DataObject'],
  Technology: ['Node','Device','SystemSoftware','TechnologyCollaboration',
    'TechnologyInterface','Path','CommunicationNetwork','TechnologyProcess',
    'TechnologyFunction','TechnologyInteraction','TechnologyEvent','TechnologyService',
    'Artifact'],
  Motivation: ['Stakeholder','Driver','Assessment','Goal','Outcome','Principle',
    'Requirement','Constraint','Value','Meaning'],
  Strategy: ['Resource','Capability','CourseOfAction','ValueStream'],
  Implementation: ['WorkPackage','Deliverable','ImplementationEvent','Gap','Plateau'],
  Physical: ['Equipment','Facility','DistributionNetwork','Material'],
};

// For each element type, which layer it belongs to
const ELEMENT_LAYER = {};
Object.entries(ARCHIMATE_LAYERS).forEach(([layer, types]) => {
  types.forEach(t => { ELEMENT_LAYER[t] = layer; });
});

// Valid cross-layer relationships per ArchiMate 3.2
// Key: "sourceLayer->targetLayer", value: allowed relationship types
const VALID_CROSS_LAYER_RELS = {
  'Business->Application': ['Serving', 'Realization', 'Assignment', 'Association', 'Influence', 'Access'],
  'Application->Business': ['Serving', 'Realization', 'Assignment', 'Association', 'Influence', 'Access'],
  'Application->Technology': ['Serving', 'Realization', 'Assignment', 'Association', 'Influence', 'Access'],
  'Technology->Application': ['Serving', 'Realization', 'Assignment', 'Association', 'Influence', 'Access'],
  'Business->Technology': ['Realization', 'Serving', 'Association', 'Influence'],
  'Technology->Business': ['Serving', 'Association', 'Influence'],
  'Motivation->Business': ['Influence', 'Association', 'Realization'],
  'Motivation->Application': ['Influence', 'Association', 'Realization'],
  'Motivation->Technology': ['Influence', 'Association', 'Realization'],
  'Business->Motivation': ['Influence', 'Association'],
  'Strategy->Business': ['Realization', 'Association', 'Influence'],
  'Strategy->Application': ['Realization', 'Association', 'Influence'],
  'Strategy->Technology': ['Realization', 'Association', 'Influence'],
};

// Same-layer invalid relationships (structural violations)
const INVALID_SAME_LAYER_RELS = {
  // Business service should not be REALIZED by technology directly (must go via app layer)
  // These are cross-layer skipping violations
};

// Relationships that go UPWARD (lower layer to higher) - should be Serving/Realization
const UPWARD_SERVING = ['Serving', 'Realization'];

// Data entity types that should be singular
const DATA_TYPES = ['DataObject','BusinessObject','Artifact'];

// Element types that can be containers (for nested spacing checks)
const CONTAINER_TYPES = ['ApplicationComponent','Node','Grouping','Location','SystemSoftware','Device'];

// ArchiMate relationship types
const REL_TYPES = ['Composition','Aggregation','Assignment','Realization','Serving',
  'Access','Influence','Triggering','Flow','Association','Specialization'];

