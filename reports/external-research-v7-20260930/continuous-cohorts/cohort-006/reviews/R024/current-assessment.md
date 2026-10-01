# R024 — frozen current assessment

Verdict: **quality failure**. Complete review: **true**. Report SHA-256: `2880232e585e815749f008bbf1664228c184be6a45ae281fabe3f5c25e6b06f7`.

Completecurrentsemanticreviewisfrozen. Thereisusefulbroadsource-groundedresearchandexplicituncertainty,butthecurrentreportmisclassifiesvalidbinarypathtransformsasviolationsandoverstatesaSHOULDrecommendation. Allsixassignedfacetshaveexplicitmissingrequirements;thereforecurrentqualityfailsfull-scopeassessment. Nooperationalfailureisinferredfromlockedhistory/native/read/GET/testclaims.

All six assigned facets and every material assertion family were assessed against the complete 896-line S003 capture. Review completeness does not imply full candidate coverage. Candidate history, operational exposure, preservation, native delivery and cost remain locked.

## Facet roster

| Facet | Coverage | Reason / missing scope |
|---|---|---|
| OME05-C01 | partial | Correctv3/attributes.ome/consistentversionandtruthfullyunresolvedlegacy;clearunsupported-versionmessageproposedaschoice. Missing: Bindopeningadmissiontothedeclared0.5andlayoutidentity;chooseexplicitcompatibilityvalidationorunsupportedresultforlegacy ratherthanleaveitoptional. |
| OME05-C02 | partial | Fullrank/order/spatialcount/uniqueanddimension_namesrules;optionaltypes,namesanddimensionsproperlyidentified. Missing: Explicitabsent-axis versuspresentlength-oneaxisnavigation/slicingdistinction;noinventedslider/coordinatecapabilitywhenrolesunavailable. |
| OME05-C03 | partial | Group-relativearbitrarypaths,declaredorder,andowntransformsarecovered;noauthoritativenumericfolderformula. Missing: Explicitmissing/unavailabledeclaredlevelhandling.; Explicitnon-power-of-two/anisotropicreductionsandlevel-specificgeometryacceptancecheck,notjustthefactor2sourceexample. |
| OME05-C04 | partial | Correctdatasetthengrouporder,scale-beforetranslationandunknownabsolutecalibration/unitcaveats. Proposednumericcheckusesonlycommutingscales. Missing: Aconcreteoffset-bearing/noncommutativeexpected-resulttestthatwouldcatchreversedcompositionoromittedoffsets. |
| OME05-C05 | partial | Labelpaths/intermediates/source.image/properties,levelcountandowngeometry/dim1degradationcovered. Associationreferenceisdocumentedbutnotresolvedasoverlayadmission. Missing: Resolveexplicit/defaultrelative source.imagefromthelabelimagelocationandvalidateintendedsourceidentitybeforeoverlay,especiallyintermediategroupanddifferentoriginimages. |
| OME05-C06 | partial | Integerdtypesandintegerlabel-valuecolor/propertykeys,paletteSHOULDandfallbackchoicesaccurate. Noexactwide-IDorresamplingcontract. Missing: Exact64-bitintegerdecode/lookupanddeclared/refusedsupportedrangebeyondbinary64precision.; ExplicitcategoricalresamplingthatnevercreatesnewIDsandmetadata-entry-order-independentlookupchecks. |

## Material failures

- **R024-F01** (valid representation misclassified): D9 lists permitted path-referencedscale/translation transforms asdetectableformatviolations. Theyarevalidandmayinsteadexceedadeclaredreadercapability;PV6correctlyrecognizesthatdistinction. Report L172 (contrastL116,L236); evidence E17, P02.

- **R024-F02** (normative force overstated): AutomaticallydeclaringareadernonconformingforviolatingaSHOULDrecommendationpromotesitintoanunconditionalMUST. Theawarenessrecommendationremainsstrong,butitsRFC2119forceisqualified. Report L85; evidence E16, E38.

- **R024-F03** (material coverage omission): Thefullsix-facetdenominatorremainspartial:versionadmissionchoice,singletonaxes,missing/nonuniformlevels,offset-sensitivecalibrationtest,relative-sourceassociationandexactcategoricalidentity/resamplingunfinished. Report Facet roster; evidence E09, E12, E19, E20, E21, E27, E29, E30.

## Complete material-claim inventory

| ID | Report locator | Current assertion | Outcome | Evidence and reason |
|---|---|---|---|---|
| R024-C001 | L3-8,L249-252 | Current artifact V002 with unchanged source/brief/plan/catalog pins,896lines/36980bytes/S003 hash. | supported | I01, E01: Carrier identity and metadata pins match; byte-identical fixed inputs independently rechecked. Report's V002 label identifies current text only. |
| R024-C002 | L3-7,L21-22,L203,L229,L242-244 | Candidate claims fresh native Goal,bindings,full sequential reading/task rule compliance,no GET or tests,bounded tool exposure and prior V001 retained. | unresolved | I01: Referenced native/protocol/final/mechanical/TASK artifacts and actual operations are locked. No operational success/failure inferred; unexecuted proposals remain proposals. |
| R024-C003 | L13-20,L37-38 | Thin plan/brief are targets rather than format evidence; RFC2119,source locators and explicit evidence/inference/unresolved/example/product classes. | supported | P01, P02, B01, E02, E38: Appropriate stated conventions. Conventions do not certify every subsequent classification; disputed cases below assessed independently. |
| R024-C004 | L21,L245 | Two groups plus baseline/cross-cutting material aggregate to full brief research. | qualified | B01, P01, P02, I01: All topical sections present and source gaps visible, but all six facet completeness requirements have missing parts. Not full candidate quality merely by topical mapping. |
| R024-C005 | L28-29,L205 | Zarrv3 with all features allowed unless explicitly disallowed. | supported | E04, E05: Accurate container and feature permission condition. |
| R024-C006 | L30,L166,L171 | Reader must parse per-array metadata and cannot assume fixed raw/chunk layout/codec or contiguous representation. | qualified | E04, E05, E07: Sound compatibility warning; exact Zarr core metadata field semantics are not admitted. Bounded codec support plus clear non-support is legitimate, as N1 later acknowledges. |
| R024-C007 | L30-31,L205 | S003 disallows no Zarr feature for image arrays; disallow list empty and no image-array codec/chunk/compression constraints. | qualified | E04, E05, E18, E19: No particular codec/chunk/compression rule in capture, but broad empty-restriction phrasing overlooks image-array2-5D/rank/order/dimension_names requirements and label-integer restriction. Source permits features subject to these conditions; report states several elsewhere. |
| R024-C008 | L33-35 | attributes.ome in zarr.json; version string hierarchy-consistent; mismatch explicit opening failure. | supported | E09, P02: Appropriate format rule/disposition. Declared0.5/legacy admission outcome remains a product question rather than resolved requirement. |
| R024-C009 | L37-38 | RFC2119; text normative except explicit non-normative examples/notes; multiscale pseudocode informative. | supported | E02, E23, E38: Proper keyword/example distinction; avoids treating example-only rdefs as guaranteed. |
| R024-C010 | L40-41,L193 | Transitional metadata intended removal; reading may be MUST/SHOULD expected,writing usually MAY; b2raw/omero transitional. | supported | E02, E13, E24: Source policy faithfully quoted including may/usually conditions. |
| R024-C011 | L42,L173-174,L193 | Read-only viewer expected to keep all transitional keys; writer would not need them/writers MAY skip them; effectively required interop. | qualified | E02, E16, E25, P02: Pragmatic interop recommendation valid, but general may-expected/usually-optional text is not blanket reader or writer exemption. Tool behavior unverified; specific feature scope/condition still matters. |
| R024-C012 | L44-46,L249 | Report/capture date/version and0.5.0/1/2 history; source latest draft not necessarily supported. | supported | E01, E37: Exact capture version qualifiers match. Draft support warning preserved. |
| R024-C013 | L46,L209,L222 | Older0.4 filesets beyond0.5 scope; unsupported-version message is explicit compatibility product option. | supported | E01, E37, B01, P02: Honest non0.5 limitation, no unsupported assumption of legacy compatibility. Complete admission choice is still unresolved. |
| R024-C014 | L52-54,L166,L184 | Images are groups,levels separate arrays,names arbitrary; dataset paths relative to group,highest-resolution first. | supported | E07, E19: Correct declared level list and path relativity; no lexical/numeric-name authority. |
| R024-C015 | L54,L184 | Directory name sorting may place10 before2; choose levels using listed metadata. | supported | E07, E19: Valid sorting counterexample,not an observed implementation bug; no erroneous threshold stated here. |
| R024-C016 | L56-57,L168 | Variable2-5D,arbitrary names,axes rank/order equal arrays,2-3space,at-mostone time/channel-null/custom,type order time→channel/custom→space. | supported | E06, E12, E18: Full source conditions covered. |
| R024-C017 | L58,L185 | Navigation driven by validated metadata/type when present,not names c/t/z; optional time/channel determines relevant controls. | supported | E10, E12, E18, P01: Appropriate no-fixed-name/no-fixed-five-axis mapping. Distinction between absent and present singleton axes not explicit. |
| R024-C018 | L60-62 | Names mandatory unique,type and unit SHOULD,custom string type MAY; units recommended UDUNITS-2 values. | supported | E10, E11: Correct optionality,not a blanket guaranteed role/unit. |
| R024-C019 | L64-66,L170,L177,L232 | Array dimension_names mandatory and matches axes; cross-check and explain malformed data. | supported | E12, E37, P02: Correct at-open integrity rule; cheap/high-value is an engineering estimate,not measured result. |
| R024-C020 | L68-69 | multiscales requires axes/datasets/path/perdataset transforms,scale onlyplus optional translation,exactlyone scale,after-scale translation,vectors axis-rank; recommended name/type/metadata. | supported | E18, E19, E20, E22: Correct navigation/calibration structure; parent paths stated separately and same obligations across hierarchy recognized. |
| R024-C021 | L71-73,L120,L170 | Optional multiscales group transforms same rules,applied after dataset transforms; skipping nonidentity ones loses calibration. | supported | E22: Correct noncommutative composition order; skipping identity list has no effect but implication concerns actual nonidentity transforms. |
| R024-C022 | L75-77,L197 | Multiple multiscales permitted; example use single/choose name/first fallback is guidance,selection rule product decision. | supported | E23, P01: Non-normative selection advice kept distinct from format list structure and viewport level policy. |
| R024-C023 | L79-80 | b2raw top-level key value3,optional OME/series stringpaths ordered as XMLImages when XML supplied. | qualified | E13, E14, E15: Exact sourceprose match; quoting3 does not establish JSONstring type (examples numeric3). OMEgroup existence not explicitly mandated. |
| R024-C024 | L80-81,L165 | No series/no plate→consecutive groups0 onward,one OME-XMLImage per group; XML SHOULD and MetadataOnly conditional mandatory. | supported | E15: Branch conditions preserved and recommended XML not universally required. |
| R024-C025 | L83-84,L164,L231 | Readers SHOULD make aware of multiple images; MAY use series,showall/choice,ignore others. | supported | E16: Main quotation accurate. D1 surface multi-image collections can mean awareness; no definite SHOULDshowall overclaim in this carrier. |
| R024-C026 | L85 | Silently showing only image0 is automatically non-conforming despite SHOULD-level awareness. | unsupported | E16, E38: Source states a SHOULD recommendation,not unconditional MUST. RFC2119 SHOULD permits justified exceptions; a categorical non-conformance conclusion overstates the force. Brief still strongly favors awareness. |
| R024-C027 | L87-88,L164 | HCS three ancestor groups(well,row,plate),well/plate specs,fields belongwell,emptygroupsSHOULDNOT,optional field labels. | supported | E08, E07: Correct conditional hierarchy requirements. |
| R024-C028 | L89 | Plan silently assumes a flat list and hierarchical plate traversal is a structural gap. | qualified | P01, P02, E08: Detailed traversal absent in thin plan,so useful proposed refinement. No text says discovery is flat/shallow; flat UI may list images discovered hierarchically. Do not convert an unspecified implementation into a proven existing assumption. |
| R024-C029 | L91-92 | Plate columns/rows/version/wells mandatory;allphysical rows/cols,uniquealnumcase names;row/col/index paths agree0-based,nodirectoriesextra. | supported | E33: Detailed plate rules correct,conditional on supportedHCS. |
| R024-C030 | L92 | Plate name/field_count SHOULD withtypes; acquisitions MAY,unique nonnegativeintegerIDs,name/maxfieldcountSHOULD,description/epoch times MAY. | supported | E32, E33: Conditional value/type requirements retained. |
| R024-C031 | L92-93 | Sparse plates legal and casecollision caution relevant locally. | supported | E33, E34, B01: Useful source-grounded novelty; actual local filesystem behavior not measured. |
| R024-C032 | L95-96 | Well images mandatory withuniquealnumcase paths,acquisitionID matchesplate when multiple,wellversionSHOULD. | supported | E35: Correct fields versus plate reference distinction. |
| R024-C033 | L98-100,L187,L196 | Plate coexists with b2raw but takes precedence; images followplate,seriesSHOULD for unawaretools,do not parse ascollection. | supported | E14, E15: Co-presence allowed and branch priority preserved; not falsely malformed merely because both keys occur. |
| R024-C034 | L100 | Detector must check plate first,b2raw alone means collection; ignoringplate can misparse. | supported | E14, E15: Valid deterministic branch inference conditional on compatible metadata. |
| R024-C035 | L102-103 | Hierarchy can local/HTTP/object store; local-only is productrestriction. | supported | E06, B01, P02: Source permits alternative store locations; does not require remote capability in this case. |
| R024-C036 | L104 | Narrow swappable access layer means local boundary costs little to maintain. | qualified | E06, P02: Explicit engineering inference/proposal,not a source guarantee or measured maintenance-cost result. Whether abstraction reduces cost is unverified. |
| R024-C037 | L110-111,L167,L183 | omero optional withconditional channels/color6hex/window4fields;example richfields/rdefs notguaranteed. | supported | E24, E25: Correct narrow guarantees and optional defaults; external WebGateway semantics not admitted. |
| R024-C038 | L112,L167-168 | Prepopulate provided hints and choose fallback if missing;channel-countmatch comment onlyexample,verify perfile. | supported | E24, E25, P01: Valid design proposal,not universal source-defined fallback colors/defaults; correctly identifies example-only size expectation. |
| R024-C039 | L114-115 | General transforms closed identity/translation/scale,sequential;vectorsinlinefloat orpathbinary,identitydefault. | supported | E17: Proper generalvocabulary;multiscales onlyscale/translation restriction statedseparately. |
| R024-C040 | L116,L177 | Plan implicitly assumes plain numeric transforms; binarypath is unacknowledged risk. | qualified | P01, E17: Plan gives no transformrepresentation assumption. Need optional capability detection/explanatory limit is sound refinement,but implicit existing numeric implementation is unsupported. |
| R024-C041 | L116,L220,L236 | Valid path transform must be detected and decoded if supported or truthfully explained as limitation;binarypayload details unresolved. | supported | E17, P02: Strong valid-format-versus-reader-limit distinction; current D9 separately misclassifies it asviolation. |
| R024-C042 | L118-121 | Perlevelscalephysicalsize/time orconditionalrelativefallback,translationafterscale,vectorsaxisrank,groupafterdataset. | supported | E20, E21, E22: All critical sourceconditions preserved,including not-applicable in directquote. |
| R024-C043 | L119,L233 | S003example0.5/1/2µmvoxels andgroup0.1mstime scale. | supported | E20, E22: Correct sourceexample values;not measured coordinate output. |
| R024-C044 | L121,L123-125,L170,L194 | Absent physicalscale/unit maypreventabsolutecalibration;showfactor/unitabsence with explicitcaveat,neverinventunits. | supported | E11, E21, B01, P01: Good unknown-calibration treatment; headline unitless clarified by explicit limitations,no falsecalibration asserted. |
| R024-C045 | L127-129,L168 | Anisotropic spatialzyxSHOULD,notguaranteed;planesliderdetectedspaceaxes. | supported | E18: Appropriate nonfixedaxisname/order navigation implication. |
| R024-C046 | L131-133,L169 | labelscontainimages,nestedataarraylevel;integer8/16/32/64,metadata-freeintermediategroups,namesarbitrary,declaredpathlistSHOULDall,labelmultiscales equalcount. | supported | E27, E28: Correct discovery/dtype/levelrules,not exactidentity/resamplingorassociation design. |
| R024-C047 | L135-136 | image-label/colors/versionSHOULDwithrequiredtypes;label-valueinteger;rgbaMAY4integers0..255;readercolorsSHOULD. | supported | E28, E29: Correct palette recommendation and integer-key structure;not universalpaletteMUST. |
| R024-C048 | L136 | Optionalproperties arrayintegerlabel-value withheterogeneousextrakeys;optional sourceobject/image relativepathdefault../../. | supported | E30: Correct complete property/source metadata rule;label-source reference resolution/identity check not made overlay step. |
| R024-C049 | L137,L169,L235 | Consume specifiedcolors,recommendfallbackpalette whenabsent/noentryrgba;tooltipspropertiesoptional. | supported | E29, E30, P01: Source-grounded recommendation and explicit productchoice. Sparse/wide-ID exactlookup/resampling stillunaddressed. |
| R024-C050 | L139-140 | Diagram dimensionsequalor1 describedSHOULD-level;usually qualifiesdimension/transformcompatibility. | qualified | E07, E26, E38: Quoted dimensionexample is valid soft guidance. A comment in informative diagram is not automatically a formal RFC2119SHOULD obligation; usually qualifies dimensional/transform equality,not all normativeprose. |
| R024-C051 | L141,L169,L195,L235 | Compute per-fileaxes/transforms,broadcastirrelevantdim1,degradewithmessage forunsupportedgeometry. | supported | E07, E26, E28, P02: Appropriate registration/degradation proposal;equallevelcountaloneinsufficient,butexplicit sourceidentityassociation remainsmissing. |
| R024-C052 | L147-148,L232 | SpeccommentedexamplesnotvalidmetadataJSON;commentsMUSTNOT,strictparsercorrect. | supported | E03: Exact prohibition;not an executedparserclaim. |
| R024-C053 | L150-151 | camelCaseprincipleexceptions;maximumfieldcount andfield_count spelledliterally,avoidnormalizingkeys. | supported | E39, E32, E33: Useful novel compatibility finding directlygrounded,normative namingrecommendationdoesnotrenameexistingfields. |
| R024-C054 | L153-154 | All topology imagegroups sharemultiscales/axes/datasetsrules. | supported | E08, E18, E19, E20: Correct source-derived transferacrossplain/series/HCSimages. |
| R024-C055 | L160 | OBLbundlesMUST/SHOULD;OPTcapability;PDproductchoice,in-plan/gap/decide;explicitreviewadditionalcapabilities. | qualified | E38, P02: Operational legendfine but MUSTandSHOULD cannotbe treatedas equivalentunconditionalduties. IndividualupgradeL85 noted. |
| R024-C056 | L164 | D1topology-aware discovery gap,b2raw/HCS/plateprecedence,multiimageawareness. | supported | E08, E14, E15, E16, P01: Sound additiontoskeletalplan;topology-specificUXchoicesremainproductdecisions. |
| R024-C057 | L165 | D2listingalreadyinplanprovidedconditionalbranches/seriesorder/ignorablegroupsfollowed. | supported | E15, E16, P01: Correctalready-coveredconditionaldisposition,not observedexistingcodecompliance. |
| R024-C058 | L166 | D3panzoom/levelchoiceinplan,butdeclaredorderingrequiredandchunkcodecdesignunspecified. | supported | E04, E05, E19, P01: Properformatversusimplementationgap; actualcodecsupportunknown. |
| R024-C059 | L167 | D4fallbackrenderingcolors/productdefaultsmissingomero;conditionalmetadataobligations. | supported | E24, E25, P01: Properoptionalversusconditionalsplit. |
| R024-C060 | L168 | D5axiscontrolscovered;defaultt0/midplaneareproductchoices,exampledefaultT/Znonguaranteed. | supported | E18, E24, E25, P01: ProposeddefaultsnotattributedtosourceMUST. |
| R024-C061 | L169 | D6overlaycapabilitycovered;alignmentdim1/transforms andfallbackneeddesign. | qualified | E27, E28, E29, E30, P01: Soundgeometry/paletteproposals,butassociatedsourceidentityandexactlabeldecode/resamplingmissing. |
| R024-C062 | L170 | D7detailscovered;honestuncalibratedaxesandcorrectcompositionneeded. | supported | E11, E12, E20, E21, E22, P01: Sourcecalibrationandunitconditionsfaithfullyretained. |
| R024-C063 | L171 | D8background/cancelproductrequirements,noS003threadingperformance;chunksmakepartialreadpossible. | qualified | E04, E05, P02: Productrequirementsclearlydistinguished;sourceallowschunkingbutdoesnotprove responsiveness, memorybehavior ordecoderpartial-readcost. |
| R024-C064 | L172 | D9detectableviolationsincludeinconsistentversion,zero/multiple scale,floatlabels,metadata-bearingintermediates,dimensionnames,plate/wellrefs,andpath-varianttransforms. | contradicted | E09, E12, E17, E20, E27, E33, E35, P02: Allnamedstructuralviolationsvalidexceptpathvariant:scale/translationpathisexpresslypermitted,notmalformed. Explainunsupporteddecoderascapabilitylimit;donotclassifyvalidrepresentationasformatviolation. |
| R024-C065 | L173 | D10realtoolinteroptiedtotransitionalb2raw/omeroreading,effectivelyrequired. | qualified | E02, E13, E24, E25, P02: Goodcompatibilitygoalrecommendation,notmeasuredactualtoolrequirementor universalreadingMUST. |
| R024-C066 | L174 | D11read-only/sessionlocalproductdiscipline;noS003writeback. | supported | B01, P02, E02: Properalreadycoveredboundary;writerusuallyoptionalnotuniversalexemption. |
| R024-C067 | L175 | D12acceptancealreadyinplan,mappedPV01-PV06,allunexecuted. | qualified | P02: Correctproposalstatus;PVsetdoesnotfullytestoffsetcomposition,sourceidentity,exactIDs,etc. |
| R024-C068 | L177 | Planlacksnamedversion/dimensionnames/multiscalechoice/pathvariants/HCSdetails. | qualified | P01, P02, E09, E12, E17, E23, E08: Textlackverified;HCSaslargestomissionisascribedreviewerpriorityratherthanasourcefact. Pathnumericassumptionnotestablished. |
| R024-C069 | L183 | RJ1rdefsnotnormativelyrequired. | supported | E24, E25: Correctfalse-rejectionavoidance:sourceexamplesnotMUST. |
| R024-C070 | L184 | RJ2numericnamesandsortingrejected. | supported | E07, E19: Correctdeclaredlistidentity. |
| R024-C071 | L185 | RJ3fixedc/t/zaxisnamesrejected,typeonlywhenavailable. | supported | E06, E10, E18: Correctarbitrarynames/conditionedtypeinference. |
| R024-C072 | L186 | RJ4alwaysgeometry-identicaloverlayMUSTrejected,samecoordinatesusuallysoft. | qualified | E26, E28, E07: Dimensions/transformsnotalwaysidentical;usuallyattaches totheparentheticalequalityratherthan same-coordinate-systemstatement. Owngeometry/associationmuststillbevalidated. |
| R024-C073 | L187 | RJ5parseplateascollectionwhenbothkeysrejected. | supported | E14, E15: Correctprecedence,notinvalidco-presence. |
| R024-C074 | L193 | CE1transitionalremovalintent versusinteropbenefitretained;readkeysandavoidnewfeatureswithoutexitplan. | qualified | E02, E13, E24, P02: Retainedtension/recommendationuseful;universaltoolinteropnecessity/exitruleaproductchoice,notnormativeguarantee. |
| R024-C075 | L194 | CE2conformingdatawithoutabsoluteunit/scale;factor-onlydisplayexplicitcaveatratherthaninventcalibration. | supported | E11, E21, B01: Important sourcecondition preserved; truthfulunsupportedviewalsolegitimateifcapabilityexceeded. |
| R024-C076 | L195 | CE3dim1/mismatchfixturesneeded;equallevelcountnotsufficientgeometryguarantee. | supported | E07, E26, E28, P02: Goodproposeddegradationchecks;relativeassociationstillmissing. |
| R024-C077 | L196 | CE4overlappingtopkeysvalidbutonlyplateprecedencecorrect. | supported | E14: Accuratemalformedversusvalidbranchdistinction. |
| R024-C078 | L197 | CE5OMEROWebGatewaymodeloriginatesinserver-siderendercontext,unverifiedsemanticslocaltransferonlyconditional;pseudocodeinformative. | qualified | E24, E23: ExternalWebGatewaypointerdoesnotestablishservermodeldetailsinsideS003;origincontextunresolvednotindependentlyverified. Explicitnotverified/conditionalimportappropriate; nooutsidefactusedascalibrationmandate. |
| R024-C079 | L201-205 | N1nodetailedcodec/chunksize/compressionrulesbutreaderbroadfeaturesorexplainlimits. | supported | E04, E05: Scopedfullsourceabsencevalidforthesefeatures;generalOMEarrayconstraintstillapplies. Actualfullreadclaimoperationalunknown. |
| R024-C080 | L206 | N2ImplementationsSeeTools,noactualreaderlist/compatibilityresearchsatisfiable. | qualified | E36, E13, E01: Readercatalog/behaviorindeedabsent. b2rawnamedwriteranddraftsupportwarningarecompatibility-adjacent statements;blanketnoanytoolcompatibilityclaimisoverbroad. Sourcegapnotworldabsence. |
| R024-C081 | L207 | N3nouiresponsiveness/background/cancellation/memoryguidanceinS003. | supported | E04, E05, P02: Completecapturehasnoproductperformancemodel;chunkpermissionnotperformanceguarantee. |
| R024-C082 | L208 | N4nointerpolation/LUT/compositingmodelMUST;conditionalomerofieldsandlabelcolorSHOULDonlydisplayrules. | qualified | E24, E25, E29, E31: SourcehasRGBAalphasemantics/example butnoformalinterpolation/LUTalgorithm. Do notreadthisaspermissiontolosscategoricalIDidentity. |
| R024-C083 | L209 | N5nomigrationmechanicsbeyondpromisedscriptsorbackcompatreaderbehavior. | supported | E01, E37: Scopedabsencegroundedbycompletechapter,notfailedsearchproof. |
| R024-C084 | L210 | N6binarytransformpayloadnotelaboratedbeyondpathbinaryreference. | supported | E17: Accurateunresolvedencodinggap;validityofdatarenderingproposalnotfalseforlackoffixture. |
| R024-C085 | L216 | U1Readerlandscape/Toolleadoutsidefixedscope,actualtoolcompatibilityunverified. | supported | E36, E13, I01: Honestunresolvedlead;noexternalcatalogused. |
| R024-C086 | L217 | U2richomerosemanticsnotadmitted;captureconstrainspresence/format. | supported | E24, E25: Properpinned-sourceboundary. |
| R024-C087 | L218 | U3externalUDUNITSvalidityunknown;customunitstringsmayappearSHOULD-level. | supported | E11: Sourcerecommendslistedunitsratherthanrequiresonlylist;unknownsneedtruthfulpresentation,notautomaticinvalidity. |
| R024-C088 | L219 | U4OME-XMLdetailsnotadmitted;seriesorderreadpossible,XMLvalidationunresolved. | supported | E15: Properexternalnormative-dependencylimit. Atmostneedseriesisanexplicitproductjudgmentnotcompleteschemagate. |
| R024-C089 | L220 | U5pathencodingunresolved,upstream/realwriterevidenceoutsideassignment. | supported | E17, I01: Fairundevelopedleadwithuncertainty. |
| R024-C090 | L221 | U6shard/storage-transformerreadpath/performanceunverified. | supported | E05: Permissiondoesnotestablishpracticalreadbehavior. |
| R024-C091 | L222 | U7non0.5unsupportedmessageisproductchoice. | supported | E01, E37, B01, P02: Noimplicitlegacyreinterpretation;admissioncontractstillnotfinalized. |
| R024-C092 | L223 | U8postcaptureerrataunknown,fixedhash/date,noliveverification. | supported | E01, I01: Honestversionlimit;noactualfetchoperationconclusionfromthisclaim. |
| R024-C093 | L231 | PV1plain/b2raw/sparseHCS-multipleacquisitionfixturescheckbranchlistingandawareness. | supported | E07, E08, E14, E15, E16, E34, E35, P02: Validunexecutedfixtureproposal;multipleacquisitionextensionneedscorrectplateIDsnotassumeoriginalsparseexamplehasmultiple. |
| R024-C094 | L232 | PV2induceversion,scale,labeldtype,intermediategroup,dimensionnames,platereferenceviolationsandexplanatorynocrashexpectation. | supported | E09, E12, E20, E27, E33, P02: Source-groundedunexecutedmalformedsuite;noinvalidpathvariantincludedhere. Missingothercasesnotfalseexecution. |
| R024-C095 | L233 | PV3examplevoxel0.5/1/2µm,group0.1mstimecheckanalyticcoords,non-numericnames. | qualified | E20, E22, E19: Correctscaleexamplebutallscale-onlytransformscommute;cannotexposereverseddataset/groupcompositionoromittedtranslationoffsets. Non-numericnamesalsodonotnecessarilyreorderlexicallywithoutadeliberateorderfixture. |
| R024-C096 | L234 | PV4largechunkslevelswitchinteraction/cancelstaleproductcheck. | supported | P02, E04, E05: Explicitunexecutedproductacceptance,nosourceperformanceclaim. |
| R024-C097 | L235 | PV5specifiedalpha/missing-colorfallback,dim1timebroadcast,equalcountandmismatchmessage. | supported | E07, E28, E29, E31, P02: Usefulunexecutedoverlaycheck;missingassociation/wide-ID/sparse-ID/interpolation. |
| R024-C098 | L236 | PV6validpathscale decodedifsupportedelseclearlimitation. | supported | E17, P02: CorrectproposalconflictswithD9malformedclassificationbutnotitselfbad;noexecutionclaimed. |
| R024-C099 | L240-245 | Claimsalltopicgroups/source/taskinputsfullyreadandallbriefmapped,externalreader/specsourcesnotinspected. | qualified | I01, B01, P01, P02: Topicalresearchpresentandexternalgapsdisclosed;actualreadslocked,allfacetcoveragepartial,nofullqualityinferencefromclaimedmapping. |
| R024-C100 | L249-252 | Sourcealiases/pins,cataloghashbytes40lines,andplan/briefpins;formatauthorityS003only. | supported | I01, E01: Identitymatchespermittedcatalog;referencepathinputs/catalog.jsonrepresentedbypreboundmetadatastaging,notactualcandidateoperationproof. |
| R024-C101 | L254-259 | V002claimsrepairedgarbledV001catalogentry/nofindingchanged andoldversionretained. | unresolved | I01: Currentcatalogidentityverified. Priorerror/findingstabilityandretentionarelockedhistory,notcurrentfalseclaimsorsuccessprooffromabsence. NoV001opened. |

## Source evidence (exact pin above; short quotations)

- **E01**, S003 L1-10, L25-27: “Final Community Group Report, 8 September 2026” This/latest/editor URI is /0.5/; editor-draft data not necessarily supported.

- **E02**, S003 L56-64: “Implementations may be expected (MUST) or encouraged (SHOULD) to support the reading of the data” A general description of possible transitional reading obligations, not a blanket requirement to implement every transitional feature.

- **E03**, S003 L65-66: “comments MUST NOT be included in JSON objects.” 

- **E04**, S003 L68-72: “version 3 of the Zarr specification.” All Zarr features may be used unless expressly disallowed; feature permission is distinct from mandatory support by every reader.

- **E05**, S003 L70-72: “unless explicitly disallowed in this specification.” Permission includes codecs, chunk grids, key encodings, data types, storage transformers. No universal reader-codec support promise is stated.

- **E06**, S003 L73-81: “represented here as it would appear locally but could equally be stored on a web server” Image rank is 2-5; axis names are arbitrary.

- **E07**, S003 L82-117: “The name of the array is arbitrary with the ordering defined by” Illustrated image/labels hierarchy; label dimensions same or 1 appears in diagram comment, not an independent MUST.

- **E08**, S003 L119-129: “Three groups MUST be defined above the images:” Well, row and plate; well/plate implement their specs. Empty row/well groups SHOULD NOT exist.

- **E09**, S003 L149-156: “ome in attributes.” OME metadata in hierarchy zarr.json; version string in ome namespace and consistent within hierarchy.

- **E10**, S003 L166-169: “The values MUST be unique across all "name" fields.” Axis name mandatory; type SHOULD and custom string types MAY. Valid custom types do not guarantee a particular reader can render them.

- **E11**, S003 L170-172: “SHOULD contain the field "unit"” Recommended UDUNITS-2 strings; absent unit does not establish dimensionless physical coordinates.

- **E12**, S003 L173-174: “MUST match the names in the "axes" metadata.” Axis-list length equals image array rank; multiscale-array dimension_names mandatory and matches axes.

- **E13**, S003 L175-191: “bioformats2raw internally introduced a wrapping layer.” Transitional multi-image layout and typical collection hierarchy, not a survey of readers.

- **E14**, S003 L193-206, L256: “MUST have the value "3"” Normative prose quotes the value; JSON examples use numeric 3. Plate metadata takes precedence when top-level represents plate; image collections cannot be mixed with plates.

- **E15**, S003 L257-270: “If the "series" attribute does not exist and no "plate" is present:” Then consecutively numbered groups starting 0; series optional list of string paths ordered as XML Images if XML supplied; XML SHOULD exist and uses MetadataOnly if present.

- **E16**, S003 L271-275: “SHOULD make users aware of the presence of more than one image” MAY show all images or offer choice; MAY use series and ignore extraneous groups. Awareness SHOULD does not require showing all images.

- **E17**, S003 L276-293: “The transformations in the list are applied sequentially and in order.” General transform types include identity default, translation, scale; vectors may be inline or stored via path.

- **E18**, S003 L295-303: “MUST contain 2 or 3 entries of "type:space"” 2-5 dimensional multiscale; optional one time and one channel/null/custom. Axis order corresponds array order and time, channel/custom, space. Anisotropic zyx is SHOULD.

- **E19**, S003 L304-307: “relative to the current zarr group.” datasets required; path required, group-relative, largest/highest-resolution to smallest; dimensionality and order equal axes.

- **E20**, S003 L308-313: “They MUST contain exactly one scale transformation” Only scale and translation; scale physical size/duration or relative factor when physical scale unavailable/applicable. Optional exactly-one translation follows scale; vectors match axes.

- **E21**, S003 L310: “If scaling information is not available or applicable for one of the axes” Relative-to-first-level factor required in this case, 1 when no downsampling. Relative values alone do not prove physical calibration.

- **E22**, S003 L314-319: “are applied after them.” Optional multiscale-level transform follows dataset transforms, subject to same type/order rules; name,type,metadata SHOULD fields.

- **E23**, S003 L388-397: “using the first multiscale as a fallback:” Named-multiscale selection/pseudocode; informative example, not a universal pyramid-level policy.

- **E24**, S003 L398-425: “See the OMERO WebGateway documentation” Example contains channel label/active/coefficient/family/inverted and rdefs defaultT/defaultZ/model; their guaranteed presence not stated by normative requirements.

- **E25**, S003 L426-430: “The "omero" metadata is optional, but if present it MUST contain the field "channels"” Each channel color six RGB hex digits and window min/max/start/end; no normative channel-list size equality sentence in capture.

- **E26**, S003 L432-436: “usually having the same dimensions and coordinate transformations” Descriptive normative prose says corresponding label image same coordinate system in segmentation case; usually qualifies dimensions/transforms. It is not marked non-normative merely because it says usually.

- **E27**, S003 L437-442: “[uint8, int8, uint16, int16, uint32, int32, uint64, int64].” Nested labels group, arbitrary label names, permitted metadata-free intermediate groups, declared labels paths; complete listing SHOULD.

- **E28**, S003 L454-460: “MUST have the same number of entries (scale levels) as the original unlabeled image.” Label multiscales required; image-label object and colors/version SHOULD, required types if present.

- **E29**, S003 L461-466: “MUST be the integer corresponding to a particular label.” colors entries keyed by label-value; rgba MAY, four integer 0-255 values if present; readers SHOULD use specified colors, not mandatory universal palette.

- **E30**, S003 L467-474: “a string specifying the relative path to a Zarr image group.” Optional properties objects keyed by integer label-value; optional source.image relative reference, default ../../ because usual nesting. Correct resolution depends on label-group location.

- **E31**, S003 L475-514: “50% blue and 50% opacity.” Example [0,0,128,128]; not evidence of actual viewer execution.

- **E32**, S003 L518-529: “greater than or equal to 0 within the context of the plate” Optional acquisitions list; unique integer ID required. Acquisition name/maximumfieldcount SHOULD; description/start/end MAY with required types.

- **E33**, S003 L530-560: “rowIndex and columnIndex MUST be 0-based.” All physical rows/columns defined even empty; alphanumeric case-sensitive unique names, avoid case-insensitive collisions SHOULD; required columns/rows/version/wells; row/column paths and indices agree.

- **E34**, S003 L641-739: “2 wells in a 96 well plate” Sparse example one acquisition/one field per well; larger grid does not imply all well subgroups populated.

- **E35**, S003 L741-752: “specifying all fields of views for a given well.” well.images list required; fields use unique alphanumeric case-sensitive paths. Each image acquisition ID required if multiple acquisitions and matches plate definition; well version SHOULD.

- **E36**, S003 L809-820: “4. Implementations See Tools.” No reader implementation catalog in capture; bioformats2raw named elsewhere as writer. This edition /0.5/, latest /latest/ also appears in citing section.

- **E37**, S003 L825-851: “Clarify that the dimension_names field in axes MUST be included.” 0.5.2 clarification,0.5.1 omero,0.5.0 Zarr v3; pre-0.5 axes/types/transforms/separator history.

- **E38**, S003 L867-888: “All of the text of this specification is normative except sections explicitly marked as non-normative, examples, and notes.” Requirements descriptive and RFC2119; lowercase keywords can carry force. Usually is a qualifier, not an automatic informative marker.

- **B01**, inputs/brief.md, entire 2 paragraphs: “local OME-Zarr 0.5 bioimaging filesets.” Read-only local viewer; discovery, multiresolution axes navigation, associated labels, calibrated coordinates, responsiveness and truthful display limits. Research actual readers broadly; distinguish format obligations, optional capabilities and product decisions.

- **P01**, inputs/plan/Viewer.md L5: “time-point and plane selection where relevant” Image listing, pan/zoom, conditional channel/time/plane controls, optional associated overlays, dimensions/units/coordinates, level choice; detailed metadata rules absent.

- **P02**, inputs/plan/Viewer.md L7-11: “Source files remain unchanged; display settings are local to the viewing session.” Background reads/cancellation, understandable failures, real tools interoperability, additional capability choices explicit review, calibration/alignment/responsiveness acceptance. No concrete fixtures.

- **I01**, stage.json, MANIFEST.json, eligibility.json, catalog.json: “Fixed admitted source S003 only; no live fetching for this component case.” Hash/source bytes/line count independently checked. All six facets assigned. Catalog metadata does not establish actual operations; no semantic companion declared.

- **E39**, S003 L809-812: “Multi-word keys in this specification should use the camelCase style.” Existing exceptions acknowledged; exact field names such as maximumfieldcount and field_count remain authoritative.

## Scope and uncertainty

{
  "verdict": "Completecurrentsemanticreviewisfrozen. Thereisusefulbroadsource-groundedresearchandexplicituncertainty,butthecurrentreportmisclassifiesvalidbinarypathtransformsasviolationsandoverstatesaSHOULDrecommendation. Allsixassignedfacetshaveexplicitmissingrequirements;thereforecurrentqualityfailsfull-scopeassessment. Nooperationalfailureisinferredfromlockedhistory/native/read/GET/testclaims.",
  "scope_limits": [
    "Actualreaderimplementations,fullZarrv3internals,OME-XML/UDUNITS/WebGatewaydetail,realfilesetperformanceandpostcaptureerrataarenotadmittedinS003. Theirvisibleunresolvedstatusisvalidanddoesnotreducethesixfacets."
  ],
  "unresolved": [
    "ActualcandidateoperationsandembeddedV001→V002history/bindingclaimsuntilphase2.",
    "Quotedb2rawvalue3isnotinterpretedasdefinitestring-onlydemand;numericexamplesretained.",
    "Server-sideWebGatewayoriginstatementnotestablishedbyadmittedpointer;noexactcitedexternalURLavailableforpermittedfirst-partyverification."
  ],
  "blinding": [
    "CurrentheaderexplicitlynamesafreshnativeGoal andfinalbinding;embeddedread/toolprotocol/mechanicalclaimsandV001correctionlogareunavoidable. NoGoal/final/protocol/mechanical/priorreportwasaccessed.",
    "Catalog/addendumreceivedonlyasprebounddependency/identitymetadata,notactualoperations."
  ],
  "inventory_control": {
    "complete_report_read_ranges": [
      "L1-110",
      "L111-163",
      "L164-259"
    ],
    "complete_original_source_read": true,
    "same_source_reuse": "Source,brief,plan,key/protocol/catalogbyteidentitywiththecompleteoriginalS003readwasverifiedbeforeassessment;claimdecisionsindependentlymadeforR024.",
    "nonassertion_lines": "Blanklines,headingsandseparatorsstructural;allsubstantivebaseline/findings/disposition/rejection/counterevidence/negative/unresolved/proposedvalidation/sourceindex/historyclaimfamiliesare represented.",
    "all_current_dispositions_reviewed": true,
    "all_unknown_and_rejected_items_reviewed": true,
    "novel_claims_independently_source_checked": true,
    "claimed_current_supersessions": "V002explicitlysupersedesV001;allcurrentdecisionclaimsjudgedasV002. Embeddedchangehistoryisunknown,nottreatedascurrentrepetitionofV001error."
  }
}

## Phase lock

No acquisition, history, native delivery, preservation or efficiency judgment has been made. Explicit root/stager unlock receipt is required after the entire cohort is frozen.
