package com.example.learning.architecture;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

@AnalyzeClasses(packages = "com.example.learning", importOptions = ImportOption.DoNotIncludeTests.class)
class LayerDependencyTest {

    @ArchTest
    static final ArchRule domain_does_not_depend_on_outer_layers = noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "..application..",
                    "..infrastructure..",
                    "..interfaces.."
            )
            .because("domain should model business rules without depending on use cases or adapters");

    @ArchTest
    static final ArchRule application_does_not_depend_on_adapters = noClasses()
            .that().resideInAPackage("..application..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "..infrastructure..",
                    "..interfaces.."
            )
            .because("application services should depend on ports, not adapter implementations");

    @ArchTest
    static final ArchRule rest_interface_does_not_depend_on_infrastructure_adapters = noClasses()
            .that().resideInAPackage("..interfaces..")
            .should().dependOnClassesThat().resideInAnyPackage("..infrastructure..")
            .because("REST controllers should call application services instead of infrastructure adapters");

    @ArchTest
    static final ArchRule infrastructure_does_not_depend_on_rest_interface_adapters = noClasses()
            .that().resideInAPackage("..infrastructure..")
            .should().dependOnClassesThat().resideInAnyPackage("..interfaces..")
            .because("adapter packages should not depend on each other");
}
