
var kgjs = require('kgjs');

function create(backingGraph) {
    return new RdfBridge(backingGraph);
}

function RdfBridge(backingGraph) {
    this.config = {};
    this.graph = backingGraph;
    this.nameToResourceMap = {};
    this.nameToPropertyMap = {};
}

RdfBridge.prototype.debugTo = function(debugTarget) {
    this.config.debugTarget = debugTarget;
    return this;
};


function addPropertyMapping(bridge, name, uriString) {
    var allLower = name.toLowerCase();

    if (allLower != name) {
        bridge.nameToPropertyMap[allLower] = uriString;
    }

    bridge.nameToPropertyMap[name] = uriString;
}

function addDefaultProperties(bridge) {
    addPropertyMapping(bridge,'National Language', 'http://www.wikidata.org/property/P37');
    addPropertyMapping(bridge,'currency', 'http://www.wikidata.org/property/P38');
}

RdfBridge.prototype.defaultSetup = function(callback) {
    var bridge = this;
    if (this.config.debugTarget) {
        this.config.debugTarget('Performing default setup for rdfBridge.');
    }

    addDefaultProperties(bridge);

    kgjs.semanticQuery.fetchByType(
        {
            endpoint: 'http://query.wikidata.org/bigdata/namespace/wdq/sparql',
            type: ['http://www.wikidata.org/entity/Q3624078', // Sovereign state.
                'http://www.wikidata.org/entity/Q3336843' // Country of the U.K.
            ]
        },
        function(result) {
            var name = result.itemLabel.value.toLowerCase();
            bridge.nameToResourceMap[name] = result.item.value;
            bridge.graph.ensureResource(result.item.value);
        },
        function(err) {
            callback(err);
        }
    );
    return this;
};

function mapResultList(list) {
    var result = null;
    if (list) {
        result = list.map(function(result) {
            return {
                'id': result.value.id,
                'label@en': result.value.name,
                'name': result.value.name
            };
        });
    }

    return result;
}

RdfBridge.prototype.list = function (subject, relationship, object, callback) {
    var subjectUri = this.nameToResourceMap[subject.toLowerCase()];
    var relationshipUri = this.nameToPropertyMap[relationship.toLowerCase()];
    // TODO - currently assuming that !object as that's all we support.

    this.graph.list(
        this.graph.ensureResource(subjectUri),
        this.graph.ensureResource(relationshipUri),
        function(err, resultList) {
            callback(err, mapResultList(resultList));
        }
    );
}

module.exports.create = create;
